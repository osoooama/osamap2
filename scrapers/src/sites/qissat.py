import time, re, os, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from sites.base import save_link, save_all_qualities, log_result
import requests

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'

BASE = 'https://ar.qissat.tv'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ar,en;q=0.5',
}


def get_tmdb_popular(media_type='movie', count=10):
    ids = []
    for page_num in range(1, 4):
        url = f'{TMDB_BASE}/{media_type}/popular?api_key={TMDB_API_KEY}&language=ar&page={page_num}'
        try:
            resp = requests.get(url, timeout=10)
            if resp.ok:
                for item in resp.json().get('results', []):
                    ids.append({
                        'id': item['id'],
                        'title': item.get('title') or item.get('name', ''),
                        'year': (item.get('release_date') or '')[:4],
                        'media_type': media_type,
                    })
            if len(ids) >= count:
                break
        except Exception:
            pass
    return ids[:count]


def search_qissat_playwright(page, query):
    search_url = f'{BASE}/search.php?keywords={requests.utils.quote(query)}'
    try:
        page.goto(search_url, wait_until='domcontentloaded', timeout=25000)
        time.sleep(3)
        page.wait_for_load_state('networkidle', timeout=10000)
    except Exception:
        pass

    try:
        results = []
        items = page.query_selector_all('.video-item, .entry, .shortstory, .short-item, .item')
        for item in items[:10]:
            link = item.query_selector('a[href*="watch.php"], a[href*="/video/"], a[href*="/watch/"]')
            if not link:
                link = item.query_selector('a')
            if not link:
                continue
            href = link.get_attribute('href', '')
            if not href:
                continue
            if not href.startswith('http'):
                href = f'{BASE}{href}'
            title_el = item.query_selector('img[alt], h3, .title, .video-title')
            title = ''
            if title_el:
                title = title_el.get_attribute('alt', '') or title_el.get_text(strip=True)
            results.append({'url': href, 'title': title})

        if not results:
            all_links = page.query_selector_all('a[href*="watch"]')
            seen = set()
            for a in all_links:
                href = a.get_attribute('href')
                if href and href not in seen:
                    seen.add(href)
                    if not href.startswith('http'):
                        href = f'{BASE}{href}'
                    results.append({'url': href, 'title': a.inner_text().strip()})

        return results
    except Exception as e:
        print(f'      Qissat search error: {e}')
        return []


def extract_streams_from_page(page, watch_url):
    try:
        page.goto(watch_url, wait_until='domcontentloaded', timeout=25000)
        time.sleep(3)

        title_el = page.query_selector('h1, h2, .title, .video-title, .entry-title')
        title = title_el.get_text(strip=True) if title_el else ''

        embed_urls = []

        for iframe in page.query_selector_all('iframe[src]'):
            src = iframe.get_attribute('src', '')
            if src:
                if not src.startswith('http'):
                    src = f'https:{src}' if src.startswith('//') else f'{BASE}{src}'
                embed_urls.append(src)

        content = page.content()
        hash_matches = re.findall(r'hash=([^&"\'<>]+)', content)
        for hash_val in hash_matches:
            try:
                import base64
                decoded = base64.b64decode(hash_val).decode('utf-8', errors='ignore')
                urls = re.findall(r'https?://[^\s"\'<>]+', decoded)
                embed_urls.extend(urls)
            except Exception:
                pass

        m3u8_in_page = re.findall(r'(https?://[^"\'<>\s]+\.m3u8(?:[^"\'<>\s]*)?)', content)
        if m3u8_in_page:
            return title, m3u8_in_page

        mp4_in_page = re.findall(r'(https?://[^"\'<>\s]+\.mp4(?:[^"\'<>\s]*)?)', content)
        if mp4_in_page:
            return title, mp4_in_page

        return title, embed_urls
    except Exception as e:
        print(f'      Watch extract error: {e}')
        return '', []


def extract_stream_from_embed(page, embed_url):
    for attempt in range(2):
        try:
            page.goto(embed_url, wait_until='domcontentloaded', timeout=20000)
            time.sleep(3)

            content = page.content()

            for pattern in [
                r'(?:file|src|source)\s*[:=]\s*["\']([^"\']+\.(?:m3u8|mp4)[^"\']*)',
                r'"(https?://[^"]+\.(?:m3u8|mp4)(?:[^"]*)?)"',
                r"'(https?://[^']+\\.(?:m3u8|mp4)(?:[^']*)?)'",
            ]:
                m = re.search(pattern, content, re.IGNORECASE)
                if m:
                    return m.group(1)

            url_match = re.search(r'(https?://[^"\'\s]+\.(?:m3u8|mp4)(?:[^"\'\s]*)?)', content)
            if url_match:
                return url_match.group(1)

            try:
                m3u8s = page.evaluate(
                    "() => performance.getEntriesByType('resource').map(e => e.name).filter(n => n.includes('.m3u8') || n.includes('.mp4'))"
                )
                for url in m3u8s:
                    if url.startswith('http'):
                        return url
            except Exception:
                pass

        except Exception as e:
            print(f'      Embed extract error: {e}')

    return None


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'turkish')
    print(f'[QISSAT] Starting crawl for {name}...')

    popular = get_tmdb_popular('tv', 10)
    popular += get_tmdb_popular('movie', 5)
    print(f'[QISSAT] {len(popular)} TMDB titles to search')

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
            context = browser.new_context(
                user_agent=HEADERS['User-Agent'],
                locale='ar',
                timezone_id='Asia/Aden',
            )
            page = context.new_page()
            Stealth().apply_stealth_sync(page)

            for item in popular:
                tid = item['id']
                title = item['title']
                print(f'  [{tid}] Searching "{title}"...')

                results = search_qissat_playwright(page, title)
                if not results:
                    print(f'    No results')
                    time.sleep(1)
                    continue

                for result in results[:3]:
                    watch_url = result['url']
                    found_title, streams_or_embeds = extract_streams_from_page(page, watch_url)
                    final_title = found_title or result['title'] or title

                    for url in streams_or_embeds:
                        if '.m3u8' in url or '.mp4' in url:
                            print(f'    [STREAM] {final_title}: {url[:80]}...')
                            if '.m3u8' in url:
                                saved = save_all_qualities(tid, watch_url, url, category, final_title)
                                total += saved
                            else:
                                save_link(tid, watch_url, url, category, final_title)
                                total += 1
                        elif url.startswith('http'):
                            stream_url = extract_stream_from_embed(page, url)
                            if stream_url:
                                print(f'    [STREAM] {final_title}: {stream_url[:80]}...')
                                if '.m3u8' in stream_url:
                                    saved = save_all_qualities(tid, watch_url, stream_url, category, final_title)
                                    total += saved
                                else:
                                    save_link(tid, watch_url, stream_url, category, final_title)
                                    total += 1
                    time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[QISSAT] Fatal: {e}')

    log_result(BASE, category, total)
    print(f'[QISSAT] {name}: {total} streams')
    return total
