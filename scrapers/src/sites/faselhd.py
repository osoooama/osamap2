import time, re, os, sys, json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from sites.base import save_link, save_all_qualities, log_result
import requests

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'
EMBED_BASE = 'https://faselhd-embed.scdns.io'

FASEL_DOMAINS = ['faselhd.club', 'faselhd.ac', 'faselhd.pro', 'faselhd.cam']

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


def resolve_fasel_domain():
    for domain in FASEL_DOMAINS:
        try:
            resp = requests.head(f'https://{domain}', timeout=8, allow_redirects=True, headers=HEADERS)
            if resp.status_code in (200, 301, 302):
                return domain
        except Exception:
            pass
    return FASEL_DOMAINS[0]


def search_fasel(page, base_url, query):
    search_url = f'{base_url}/?s={query.replace(" ", "+")}'
    try:
        page.goto(search_url, wait_until='domcontentloaded', timeout=30000)
        time.sleep(3)

        page.wait_for_load_state('networkidle', timeout=10000)
    except Exception:
        pass

    try:
        results = []
        items = page.query_selector_all('div.postDiv a, div.moviePost a, a[href*="/?p="], .movie-item a, article a')
        seen = set()
        for item in items[:10]:
            href = item.get_attribute('href')
            if href and href not in seen:
                seen.add(href)
                title_el = item.query_selector('img')
                title = title_el.get_attribute('alt') if title_el else ''
                results.append({'url': href, 'title': title})
        return results
    except Exception as e:
        print(f'      Search error: {e}')
        return []


def extract_stream_from_embed(page, embed_url, retries=2):
    for attempt in range(retries):
        try:
            page.goto(embed_url, wait_until='domcontentloaded', timeout=20000)
            time.sleep(3)

            content = page.content()

            for pattern in [
                r'file\s*[:=]\s*["\']([^"\']+\.m3u8[^"\']*)',
                r'source\s*[:=]\s*["\']([^"\']+\.m3u8[^"\']*)',
                r'"(https?://[^"]+\.m3u8[^"]*)"',
                r"'(https?://[^']+\\.m3u8[^']*)'",
            ]:
                m = re.search(pattern, content)
                if m:
                    return m.group(1)

            m3u8_match = re.search(r'(https?://[^"\'<>\s]+\.m3u8(?:[^"\'<>\s]*)?)', content)
            if m3u8_match:
                return m3u8_match.group(1)

            try:
                m3u8s = page.evaluate(
                    "() => performance.getEntriesByType('resource').map(e => e.name).filter(n => n.includes('.m3u8'))"
                )
                for url in m3u8s:
                    if url.startswith('http'):
                        return url
            except Exception:
                pass

            mp4_match = re.search(r'(https?://[^"\'<>\s]+\.mp4(?:[^"\'<>\s]*)?)', content)
            if mp4_match:
                return mp4_match.group(1)

            if attempt < retries - 1:
                time.sleep(2)

        except Exception as e:
            print(f'      Embed extract error (attempt {attempt+1}): {e}')
            if attempt < retries - 1:
                time.sleep(2)

    return None


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'arabic')
    print(f'[FASELHD] Starting crawl for {name}...')

    base_url = f'https://{resolve_fasel_domain()}'
    print(f'[FASELHD] Using domain: {base_url}')

    popular = get_tmdb_popular('movie', 10)
    popular += get_tmdb_popular('tv', 10)
    print(f'[FASELHD] {len(popular)} TMDB titles to search')

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

                results = search_fasel(page, base_url, title)
                if not results:
                    print(f'    No results')
                    time.sleep(1)
                    continue

                for result in results[:3]:
                    page_url = result['url']
                    if not page_url.startswith('http'):
                        page_url = f'{base_url}{page_url}'

                    try:
                        page.goto(page_url, wait_until='domcontentloaded', timeout=20000)
                        time.sleep(2)

                        title_el = page.query_selector('h1, h2, .entry-title, .title')
                        found_title = title_el.inner_text().strip() if title_el else result['title'] or title

                        iframes = page.query_selector_all('iframe')
                        embed_src = None
                        for ifr in iframes:
                            src = ifr.get_attribute('src') or ''
                            if 'scdns' in src or 'embed' in src or 'player' in src:
                                embed_src = src
                                break
                        if not embed_src and iframes:
                            embed_src = iframes[0].get_attribute('src') or ''

                        if not embed_src:
                            continue

                        if not embed_src.startswith('http'):
                            embed_src = f'https:{embed_src}' if embed_src.startswith('//') else f'https://faselhd-embed.scdns.io{embed_src}'

                        stream_url = extract_stream_from_embed(page, embed_src)
                        if stream_url:
                            print(f'    [STREAM] {found_title}: {stream_url[:80]}...')
                            if '.m3u8' in stream_url:
                                saved = save_all_qualities(tid, page_url, stream_url, category, found_title)
                                total += saved
                            else:
                                save_link(tid, page_url, stream_url, category, found_title)
                                total += 1
                    except Exception as e:
                        print(f'    Error: {e}')

                    time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[FASELHD] Fatal: {e}')

    log_result(base_url, category, total)
    print(f'[FASELHD] {name}: {total} streams')
    return total
