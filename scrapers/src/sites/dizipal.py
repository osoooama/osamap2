import time, re, os, sys, json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from sites.base import save_link, save_all_qualities, log_result
import requests

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'

DIZIPAL_DOMAINS = [
    'dizipal104.vip', 'dizipal105.com', 'dizipal106.com',
    'dizipal107.com', 'dizipal108.com', 'dizipal109.com',
    'dizipal110.com', 'dizipal111.com', 'dizipal112.com',
    'dizipal113.com', 'dizipal114.com', 'dizipal115.com',
    'dizipal116.com', 'dizipal117.com', 'dizipal118.com',
    'dizipal119.com', 'dizipal120.com',
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}


def get_tmdb_popular(media_type='movie', count=10):
    ids = []
    for page_num in range(1, 4):
        url = f'{TMDB_BASE}/{media_type}/popular?api_key={TMDB_API_KEY}&language=tr&page={page_num}'
        try:
            resp = requests.get(url, timeout=10)
            if resp.ok:
                for item in resp.json().get('results', []):
                    ids.append({
                        'id': item['id'],
                        'title': item.get('title') or item.get('name', ''),
                        'name': item.get('name', ''),
                        'year': (item.get('release_date') or '')[:4],
                        'media_type': media_type,
                    })
            if len(ids) >= count:
                break
        except Exception:
            pass
    return ids[:count]


def find_active_domain():
    for domain in DIZIPAL_DOMAINS:
        try:
            resp = requests.head(f'https://{domain}', timeout=8, allow_redirects=True, headers=HEADERS)
            if resp.status_code in (200, 301, 302):
                return domain
        except Exception:
            pass
    return DIZIPAL_DOMAINS[0]


def search_dizipal(page, base_url, query):
    search_url = f'{base_url}/search/{query.replace(" ", "-")}'
    try:
        page.goto(search_url, wait_until='domcontentloaded', timeout=20000)
        time.sleep(3)

        results = []
        items = page.query_selector_all('a[href*="/dizi/"], a[href*="/film/"], a[href*="/series/"]')
        seen = set()
        for item in items[:10]:
            href = item.get_attribute('href')
            if href and href not in seen:
                seen.add(href)
                title_el = item.query_selector('img, h3, span')
                title = ''
                if title_el:
                    title = title_el.get_attribute('alt') or title_el.inner_text() or ''
                results.append({'url': href, 'title': title.strip()})
        return results
    except Exception as e:
        print(f'      Search error: {e}')
        return []


def extract_stream_from_episode(page, episode_url):
    try:
        page.goto(episode_url, wait_until='domcontentloaded', timeout=20000)
        time.sleep(3)

        title_el = page.query_selector('h1, h2, .title, .entry-title')
        title = title_el.inner_text().strip() if title_el else ''

        embed_iframe = page.query_selector('#vast_new iframe, .player iframe, iframe[src*="embed"]')
        if not embed_iframe:
            iframes = page.query_selector_all('iframe')
            for ifr in iframes:
                src = ifr.get_attribute('src') or ''
                if 'embed' in src or 'player' in src:
                    embed_iframe = ifr
                    break

        if not embed_iframe:
            return title, []

        embed_src = embed_iframe.get_attribute('src')
        if not embed_src:
            return title, []

        if not embed_src.startswith('http'):
            embed_src = f'https:{embed_src}' if embed_src.startswith('//') else f'{base_url}{embed_src}'

        page.goto(embed_src, wait_until='domcontentloaded', timeout=15000)
        time.sleep(3)

        content = page.content()
        scripts = page.query_selector_all('script')
        for script in scripts:
            inner = script.inner_text()
            file_match = re.search(r'file\s*[:=]\s*["\']([^"\']+)', inner)
            if file_match:
                stream_url = file_match.group(1)
                return title, [stream_url]

        url_match = re.search(r'(https?://[^"\']+\.(?:m3u8|mp4)[^"\']*)', content)
        if url_match:
            return title, [url_match.group(1)]

        return title, []
    except Exception as e:
        print(f'      Episode extract error: {e}')
        return '', []


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'turkish')
    print(f'[DIZIPAL] Starting crawl for {name}...')

    base_url = f'https://{find_active_domain()}'
    print(f'[DIZIPAL] Using domain: {base_url}')

    popular = get_tmdb_popular('tv', 15)
    print(f'[DIZIPAL] {len(popular)} TMDB TV titles to search')

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
            context = browser.new_context(user_agent=HEADERS['User-Agent'])
            page = context.new_page()

            for item in popular:
                tid = item['id']
                title = item['title'] or item['name']
                print(f'  [{tid}] Searching "{title}"...')

                results = search_dizipal(page, base_url, title)
                if not results:
                    print(f'    No results')
                    time.sleep(1)
                    continue

                for result in results[:2]:
                    page_url = result['url']
                    if not page_url.startswith('http'):
                        page_url = f'{base_url}{page_url}'

                    try:
                        page.goto(page_url, wait_until='domcontentloaded', timeout=20000)
                        time.sleep(2)

                        ep_links = [a.get_attribute('href') for a in page.query_selector_all('a[href*="/bolum/"], a[href*="/episode/"]')]
                        ep_links = [l for l in ep_links if l]

                        if not ep_links:
                            ep_url = page_url
                            ep_title, stream_urls = extract_stream_from_episode(page, ep_url)
                            for stream_url in stream_urls:
                                if stream_url:
                                    print(f'    [STREAM] {title}: {stream_url[:80]}...')
                                    if '.m3u8' in stream_url:
                                        saved = save_all_qualities(tid, ep_url, stream_url, category, title)
                                        total += saved
                                    else:
                                        save_link(tid, ep_url, stream_url, category, title)
                                        total += 1
                        else:
                            for ep_link in ep_links[:5]:
                                if not ep_link.startswith('http'):
                                    ep_link = f'{base_url}{ep_link}'
                                ep_title, stream_urls = extract_stream_from_episode(page, ep_link)
                                for stream_url in stream_urls:
                                    if stream_url:
                                        print(f'    [STREAM] {title}: {stream_url[:80]}...')
                                        if '.m3u8' in stream_url:
                                            saved = save_all_qualities(tid, ep_link, stream_url, category, title)
                                            total += saved
                                        else:
                                            save_link(tid, ep_link, stream_url, category, title)
                                            total += 1
                                time.sleep(1)
                    except Exception as e:
                        print(f'    Error: {e}')

                time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[DIZIPAL] Fatal: {e}')

    log_result(base_url, category, total)
    print(f'[DIZIPAL] {name}: {total} streams')
    return total
