import time, re, os, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from sites.base import save_link, save_all_qualities, log_result
import requests

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

HDFILM_DOMAINS = [
    'hdfilmcehennemi.sh', 'hdfilmcehennemi.tech',
    'hdfilmcehennemi.nl', 'hdfilmcehennemi.ws', 'hdfilmcehennemi.mobi',
    'hdfilmcehennemi.com', 'hdfilmcehennemi.org', 'hdfilmcehennemi.me',
]

DIZILLA_DOMAINS = ['dizilla.club', 'dizilla.to', 'dizilla.com']


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


def find_active_domain(domains):
    for domain in domains:
        try:
            resp = requests.head(f'https://{domain}', timeout=8, allow_redirects=True, headers=HEADERS)
            if resp.status_code in (200, 301, 302):
                return domain
        except Exception:
            pass
    return domains[0]


def search_tmdb(title):
    if not title or len(title) < 3:
        return None
    try:
        resp = requests.get(f'{TMDB_BASE}/search/multi?api_key={TMDB_API_KEY}&language=tr&query={title[:50]}', timeout=10)
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


def extract_stream_from_page(page, url):
    try:
        page.goto(url, wait_until='domcontentloaded', timeout=20000)
        time.sleep(2)

        content = page.content()

        for pattern in [
            r'(?:file|src|source)\s*[:=]\s*["\']([^"\']+\.(?:m3u8|mp4)[^"\']*)',
            r'"(https?://[^"]+\.(?:m3u8|mp4)(?:[^"]*)?)"',
        ]:
            m = re.search(pattern, content, re.IGNORECASE)
            if m:
                return m.group(1)

        url_match = re.search(r'(https?://[^"\'\s]+\.(?:m3u8|mp4)(?:[^"\'\s]*)?)', content)
        if url_match:
            return url_match.group(1)

        embed_iframe = page.query_selector('iframe[src*="embed"], iframe[src*="player"], iframe')
        if embed_iframe:
            return embed_iframe.get_attribute('src')

        return None
    except Exception:
        return None


def crawl_hdfilmcehennemi(browser, limit=15):
    domain = find_active_domain(HDFILM_DOMAINS)
    base_url = f'https://{domain}'
    print(f'[HDFILM] Using domain: {base_url}')

    popular = get_tmdb_popular('movie', limit)
    total = 0

    page = browser.new_page()
    Stealth().apply_stealth_sync(page)
    try:
        page.goto(base_url, wait_until='domcontentloaded', timeout=25000)
        time.sleep(4)

        movie_links = list(set(
            a.get_attribute('href')
            for a in page.query_selector_all('a[href*="/film/"], a[href*="/movie/"], a[href*="/izle/"]')
            if a.get_attribute('href')
        ))

        if not movie_links:
            movie_links = list(set(
                a.get_attribute('href')
                for a in page.query_selector_all('a[href]')
                if a.get_attribute('href') and any(x in (a.get_attribute('href') or '') for x in ['/film/', '/movie/', '/izle/'])
            ))

        print(f'[HDFILM] Found {len(movie_links)} movie links on homepage')

        for link in movie_links[:limit]:
            if not link.startswith('http'):
                link = f'{base_url}{link}'

            try:
                page.goto(link, wait_until='domcontentloaded', timeout=20000)
                time.sleep(2)

                title_el = page.query_selector('h1, h2, .title, .film-title, .entry-title')
                title = title_el.inner_text().strip() if title_el else ''

                stream_url = extract_stream_from_page(page, link)
                if stream_url:
                    tmdb_id = search_tmdb(title)
                    if '.m3u8' in stream_url:
                        print(f'    [{title}] M3U8: {stream_url[:80]}...')
                        save_all_qualities(tmdb_id or link, link, stream_url, 'turkish', title)
                        total += 1
                    else:
                        print(f'    [{title}] Stream: {stream_url[:80]}...')
                        save_link(tmdb_id or link, link, stream_url, 'turkish', title)
                        total += 1

                scripts = page.query_selector_all('script')
                for script in scripts:
                    inner = script.inner_text()
                    if 'playerjs' in inner.lower() or 'file' in inner.lower():
                        m3u8 = re.search(r'file\s*[:=]\s*["\']([^"\']+\.m3u8[^"\']*)', inner)
                        if m3u8:
                            tmdb_id = search_tmdb(title)
                            print(f'    [{title}] M3U8: {m3u8.group(1)[:80]}...')
                            save_all_qualities(tmdb_id or link, link, m3u8.group(1), 'turkish', title)
                            total += 1

            except Exception as e:
                print(f'    Error: {e}')

            time.sleep(1)
    except Exception as e:
        print(f'[HDFILM] Error: {e}')
    finally:
        page.close()

    return total


def crawl_dizilla(browser, limit=15):
    domain = find_active_domain(DIZILLA_DOMAINS)
    base_url = f'https://{domain}'
    print(f'[DIZILLA] Using domain: {base_url}')

    popular = get_tmdb_popular('tv', limit)
    total = 0

    page = browser.new_page()
    Stealth().apply_stealth_sync(page)
    try:
        page.goto(base_url, wait_until='domcontentloaded', timeout=25000)
        time.sleep(3)

        series_links = list(set(
            a.get_attribute('href')
            for a in page.query_selector_all('a[href*="-izle"], a[href*="/dizi/"], a[href*="/series/"]')
            if a.get_attribute('href')
        ))
        print(f'[DIZILLA] Found {len(series_links)} series links')

        for link in series_links[:limit]:
            if not link.startswith('http'):
                link = f'{base_url}{link}'

            try:
                page.goto(link, wait_until='domcontentloaded', timeout=20000)
                time.sleep(2)

                title_el = page.query_selector('h1, h2, .series-title, .title')
                title = title_el.inner_text().strip() if title_el else ''

                ep_links = [a.get_attribute('href') for a in page.query_selector_all('a[href*="-bolum-"], a[href*="/episode/"]')]
                ep_links = [l for l in ep_links if l]

                if ep_links:
                    for ep_link in ep_links[:3]:
                        if not ep_link.startswith('http'):
                            ep_link = f'{base_url}{ep_link}'

                        stream_url = extract_stream_from_page(page, ep_link)
                        if stream_url:
                            tmdb_id = search_tmdb(title)
                            if '.m3u8' in stream_url:
                                print(f'    [{title}] M3U8: {stream_url[:80]}...')
                                save_all_qualities(tmdb_id or ep_link, ep_link, stream_url, 'turkish', title)
                                total += 1
                            else:
                                print(f'    [{title}] Stream: {stream_url[:80]}...')
                                save_link(tmdb_id or ep_link, ep_link, stream_url, 'turkish', title)
                                total += 1
                        time.sleep(1)
                else:
                    stream_url = extract_stream_from_page(page, link)
                    if stream_url:
                        tmdb_id = search_tmdb(title)
                        if '.m3u8' in stream_url:
                            save_all_qualities(tmdb_id or link, link, stream_url, 'turkish', title)
                            total += 1
                        else:
                            save_link(tmdb_id or link, link, stream_url, 'turkish', title)
                            total += 1

            except Exception as e:
                print(f'    Error: {e}')

            time.sleep(1)
    except Exception as e:
        print(f'[DIZILLA] Error: {e}')
    finally:
        page.close()

    return total


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'turkish')
    print(f'[TURKISH] Starting crawl for {name}...')

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])

            if 'hdfilm' in name.lower():
                total = crawl_hdfilmcehennemi(browser)
            elif 'dizilla' in name.lower():
                total = crawl_dizilla(browser)
            else:
                total = crawl_hdfilmcehennemi(browser)
                total += crawl_dizilla(browser)

            browser.close()
    except Exception as e:
        print(f'[TURKISH] Fatal: {e}')

    log_result(name, category, total)
    print(f'[TURKISH] {name}: {total} streams')
    return total
