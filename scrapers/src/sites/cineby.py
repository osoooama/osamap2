import time
import os
import requests
from playwright.sync_api import sync_playwright
from sites.base import save_all_qualities, save_link, log_result, verify_stream_url

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'

SITES = [
    {'name': 'www.streamex.net', 'category': 'foreign'},
]

CLASSIC_IDS = [278, 238, 680, 550, 155, 497, 424, 807, 27205, 157336,
               550, 1892, 1359, 122, 11, 1891, 4977, 121, 429, 98]


def get_tmdb_popular(media_type='movie', count=10):
    ids = []
    for page in range(1, 5):
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


def extract_from_xpass(page, xpass_url):
    for attempt in range(3):
        try:
            page.goto(xpass_url, wait_until='domcontentloaded', timeout=30000)
            time.sleep(6)

            m3u8 = page.evaluate(
                "() => performance.getEntriesByType('resource').map(e => e.name).filter(n => n.includes('.m3u8'))"
            )
            if m3u8:
                return m3u8

            video = page.query_selector('video')
            if video:
                src = video.get_attribute('src') or video.get_attribute('currentSrc')
                if src and '.m3u8' in src:
                    return [src]
        except:
            pass
        time.sleep(2)
    return []


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'foreign')
    base_url = f'https://{name}/watch'
    print(f'[CINEBY] Crawling {name} (category={category})...')

    popular = get_tmdb_popular('movie', 15)
    for cid in CLASSIC_IDS:
        if cid not in [p['id'] for p in popular]:
            popular.append({'id': cid, 'title': '', 'year': '', 'media_type': 'movie'})
    print(f'[CINEBY] Got {len(popular)} TMDB IDs')

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
            page = browser.new_page()

            for item in popular:
                tid = item['id']
                title = item['title']
                watch_url = f'{base_url}/movie/{tid}'
                print(f'  [{tid}] {title[:50]}')

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
                        saved = save_link(tid, watch_url, xpass_src, category, title)
                        if saved:
                            total += 1
                            print(f'    Saved xpass URL')
                        else:
                            print(f'    xpass URL rejected')
                    else:
                        print(f'    No xpass iframe found')

                except Exception as e:
                    print(f'    Error: {e}')

                time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[CINEBY] Fatal: {e}')

    log_result(base_url, category, total)
    print(f'[CINEBY] {name}: {total} streams')
    return total
