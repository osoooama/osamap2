import time, re, os, sys, base64, json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from sites.base import save_link, save_all_qualities, log_result
import requests

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'
EMBED_BASE = 'https://faselhd-embed.scdns.io'

FASEL_DOMAINS = ['faselhd.club', 'faselhd.ac', 'faselhd.pro']

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


def search_tmdb(title):
    if not title or len(title) < 3:
        return None
    try:
        resp = requests.get(f'{TMDB_BASE}/search/multi?api_key={TMDB_API_KEY}&language=ar&query={title[:50]}', timeout=10)
        if resp.ok:
            results = resp.json().get('results', [])
            for r in results:
                if r.get('media_type') in ('movie', 'tv'):
                    return str(r['id'])
            if results:
                return str(results[0]['id'])
    except Exception:
        pass
    return None


def try_fasel_domain(page, domain, timeout=15000):
    try:
        resp = page.goto(f'https://{domain}', wait_until='domcontentloaded', timeout=timeout)
        if resp and resp.status == 200:
            return domain
    except Exception:
        pass
    return None


def resolve_fasel_domain():
    for domain in FASEL_DOMAINS:
        try:
            resp = requests.head(f'https://{domain}', timeout=8, allow_redirects=True, headers=HEADERS)
            if resp.status_code == 200:
                return domain
        except Exception:
            pass
    return FASEL_DOMAINS[0]


def search_fasel(page, base_url, query):
    search_url = f'{base_url}/?s={query.replace(" ", "+")}'
    try:
        page.goto(search_url, wait_until='domcontentloaded', timeout=20000)
        time.sleep(2)

        results = []
        items = page.query_selector_all('div.postDiv a, div.moviePost a, a[href*="/?p="]')
        seen = set()
        for item in items[:10]:
            href = item.get_attribute('href')
            if href and href not in seen:
                seen.add(href)
                title_el = item.query_selector('img')
                title = title_el.get_attribute('alt') if title_el else ''
                poster_el = item.query_selector('img')
                poster = poster_el.get_attribute('data-src') or poster_el.get_attribute('src') if poster_el else ''
                results.append({'url': href, 'title': title, 'poster': poster})
        return results
    except Exception as e:
        print(f'      Search error: {e}')
        return []


def extract_embed_from_page(page, watch_url):
    try:
        page.goto(watch_url, wait_until='domcontentloaded', timeout=20000)
        time.sleep(3)

        title_el = page.query_selector('h1, h2, .entry-title, .title')
        title = title_el.inner_text().strip() if title_el else ''

        iframe = page.query_selector('iframe[name="player_iframe"], iframe[src*="embed"], iframe[src*="scdns"]')
        if not iframe:
            iframes = page.query_selector_all('iframe')
            for ifr in iframes:
                src = ifr.get_attribute('src') or ''
                if 'scdns' in src or 'embed' in src or 'player' in src:
                    iframe = ifr
                    break

        if not iframe:
            return title, []

        embed_src = iframe.get_attribute('src')
        if not embed_src:
            return title, []

        if not embed_src.startswith('http'):
            embed_src = f'https:{embed_src}' if embed_src.startswith('//') else f'https://faselhd-embed.scdns.io{embed_src}'

        return title, [embed_src]
    except Exception as e:
        print(f'      Extract error: {e}')
        return '', []


def extract_m3u8_from_embed(page, embed_url):
    try:
        page.goto(embed_url, wait_until='domcontentloaded', timeout=15000)
        time.sleep(3)

        content = page.content()
        scripts = page.query_selector_all('script')
        for script in scripts:
            inner = script.inner_text()
            if 'playerjs' in inner.lower() or 'file' in inner:
                m = re.search(r'file\s*[:=]\s*["\']([^"\']+\.m3u8[^"\']*)', inner)
                if m:
                    return m.group(1)

        m3u8_match = re.search(r'(https?://[^"\']+\.m3u8[^"\']*)', content)
        if m3u8_match:
            return m3u8_match.group(1)

        page.wait_for_timeout(5000)
        content = page.content()
        m3u8_match = re.search(r'(https?://[^"\']+\.m3u8[^"\']*)', content)
        if m3u8_match:
            return m3u8_match.group(1)

    except Exception as e:
        print(f'      M3U8 extract error: {e}')
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
            context = browser.new_context(user_agent=HEADERS['User-Agent'])
            page = context.new_page()

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

                    found_title, embed_urls = extract_embed_from_page(page, page_url)
                    final_title = found_title or result['title'] or title

                    for embed_url in embed_urls:
                        stream_url = extract_m3u8_from_embed(page, embed_url)
                        if stream_url and '.m3u8' in stream_url:
                            print(f'    [M3U8] {final_title}: {stream_url[:80]}...')
                            saved = save_all_qualities(tid, page_url, stream_url, category, final_title)
                            total += saved
                        elif stream_url:
                            print(f'    [STREAM] {final_title}: {stream_url[:80]}...')
                            save_link(tid, page_url, stream_url, category, final_title)
                            total += 1
                    time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[FASELHD] Fatal: {e}')

    log_result(base_url, category, total)
    print(f'[FASELHD] {name}: {total} streams')
    return total
