import time
import os
import requests
from playwright.sync_api import sync_playwright
from sites.base import save_link, log_result

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'

SITES = [
    {'name': 'www.streamex.net', 'category': 'foreign'},
    {'name': 'cineby.cc', 'category': 'foreign'},
]


def get_tmdb_popular(media_type='movie', count=10):
    ids = []
    for page in range(1, 3):
        url = f'{TMDB_BASE}/{media_type}/popular?api_key={TMDB_API_KEY}&page={page}'
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
        except:
            pass
    return ids[:count]


def extract_m3u8_from_xpass(page, xpass_url, retries=3):
    for attempt in range(retries):
        try:
            page.goto(xpass_url, wait_until='domcontentloaded', timeout=30000)
            time.sleep(5)
            m3u8 = page.evaluate(
                "() => performance.getEntriesByType('resource').map(e => e.name).filter(n => n.includes('.m3u8')).slice(0, 5)"
            )
            if m3u8:
                return m3u8
        except:
            pass
        time.sleep(2)
    return []


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'foreign')
    base_url = f'https://{name}/watch'
    print(f'[CINEBY] Crawling {name} (category={category})...')

    ids = get_tmdb_popular('movie', 5)
    print(f'[CINEBY] Got {len(ids)} TMDB IDs')

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
            page = browser.new_page()

            for item in ids:
                tid = item['id']
                title = item['title']
                watch_url = f'{base_url}/movie/{tid}'
                print(f'  [{tid}] {title}')

                try:
                    page.goto(watch_url, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(4)

                    iframes = page.query_selector_all('iframe')
                    xpass_src = None
                    for f in iframes:
                        src = f.get_attribute('src')
                        if src and 'xpass' in src:
                            xpass_src = src
                            break

                    if xpass_src:
                        print(f'    xpass iframe: {xpass_src[:100]}')
                        m3u8_urls = extract_m3u8_from_xpass(page, xpass_src)
                        if m3u8_urls:
                            master = m3u8_urls[0]
                            print(f'    STREAM: {master[:100]}')
                            save_link(tid, watch_url, master, category, title)
                            total += 1
                        else:
                            print(f'    No m3u8 found from xpass')
                    else:
                        print(f'    No xpass iframe found')

                    if total >= 3:
                        break

                except Exception as e:
                    print(f'    Error: {e}')

                time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[CINEBY] Fatal: {e}')

    log_result(base_url, category, total)
    print(f'[CINEBY] {name}: {total} streams')
    return total
