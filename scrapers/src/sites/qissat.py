import time, re, os, sys, base64
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
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


def search_qissat(query):
    search_url = f'{BASE}/search.php?keywords={requests.utils.quote(query)}'
    try:
        resp = requests.get(search_url, timeout=15, headers=HEADERS)
        if not resp.ok:
            return []

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(resp.text, 'lxml')

        results = []
        for item in soup.select('.video-item, .entry, .shortstory')[:10]:
            link = item.select_one('a[href*="watch.php"]')
            if not link:
                continue
            href = link.get('href', '')
            if not href.startswith('http'):
                href = f'{BASE}{href}'
            title_el = item.select_one('img[alt], h3, .title, .video-title')
            title = ''
            if title_el:
                title = title_el.get('alt', '') or title_el.get_text(strip=True)
            thumb_el = item.select_one('img')
            thumb = thumb_el.get('src', '') if thumb_el else ''
            results.append({'url': href, 'title': title, 'thumb': thumb})
        return results
    except Exception as e:
        print(f'      Qissat search error: {e}')
        return []


def decode_qissat_hash(encoded_str):
    try:
        decoded = base64.b64decode(encoded_str).decode('utf-8', errors='ignore')
        urls = re.findall(r'https?://[^\s"\'<>]+', decoded)
        return urls
    except Exception:
        return []


def extract_streams_from_watch(page, watch_url):
    try:
        resp = requests.get(watch_url, timeout=15, headers=HEADERS)
        if not resp.ok:
            return '', []

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(resp.text, 'lxml')

        title_el = soup.select_one('h1, h2, .title, .video-title')
        title = title_el.get_text(strip=True) if title_el else ''

        embed_urls = []

        for iframe in soup.select('iframe[src]'):
            src = iframe.get('src', '')
            if src:
                if not src.startswith('http'):
                    src = f'https:{src}' if src.startswith('//') else f'{BASE}{src}'
                embed_urls.append(src)

        for a in soup.select('a[href*="nasmat"], a[href*="hash="]'):
            href = a.get('href', '')
            if 'hash=' in href:
                hash_match = re.search(r'hash=([^&"\']+)', href)
                if hash_match:
                    decoded_urls = decode_qissat_hash(hash_match.group(1))
                    embed_urls.extend(decoded_urls)

        return title, embed_urls
    except Exception as e:
        print(f'      Watch extract error: {e}')
        return '', []


def extract_stream_from_embed(page, embed_url):
    try:
        if not embed_url.startswith('http'):
            return None

        page.goto(embed_url, wait_until='domcontentloaded', timeout=15000)
        time.sleep(3)

        content = page.content()

        scripts = page.query_selector_all('script')
        for script in scripts:
            inner = script.inner_text()
            file_match = re.search(r'(?:file|src|source)\s*[:=]\s*["\']([^"\']+\.(?:m3u8|mp4)[^"\']*)', inner, re.IGNORECASE)
            if file_match:
                return file_match.group(1)

        url_match = re.search(r'(https?://[^"\'\s]+\.(?:m3u8|mp4)(?:[^"\'\s]*)?)', content)
        if url_match:
            return url_match.group(1)

        return None
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
            context = browser.new_context(user_agent=HEADERS['User-Agent'])
            page = context.new_page()

            for item in popular:
                tid = item['id']
                title = item['title']
                print(f'  [{tid}] Searching "{title}"...')

                results = search_qissat(title)
                if not results:
                    print(f'    No results')
                    time.sleep(1)
                    continue

                for result in results[:3]:
                    watch_url = result['url']
                    found_title, embed_urls = extract_streams_from_watch(page, watch_url)
                    final_title = found_title or result['title'] or title

                    for embed_url in embed_urls:
                        stream_url = extract_stream_from_embed(page, embed_url)
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
