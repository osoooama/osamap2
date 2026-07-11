import time
import requests
import os

from playwright.sync_api import sync_playwright
from sites.base import save_link, save_all_qualities, log_result

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'

SITE_CONFIGS = {
    'mycima.video': {'search_url': 'https://mycima.video/search/{query}', 'category': 'arabic'},
    'eegebest.com': {'search_url': 'https://eegebest.com/search/{query}', 'category': 'arabic'},
    'fajer.show': {'search_url': 'https://fajer.show/search/{query}', 'category': 'arabic'},
    '3iskk.xyz': {'search_url': 'https://3iskk.xyz/search/{query}', 'category': 'arabic'},
    '7obtv.co': {'search_url': 'https://7obtv.co/search/{query}', 'category': 'arabic'},
    'dizipal2085.com': {'search_url': 'https://dizipal2085.com/search/{query}', 'category': 'turkish'},
}


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


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'arabic')
    base_url = f'https://{name}'
    config = SITE_CONFIGS.get(name)
    print(f'[ARABIC] Crawling {name}...')

    popular = get_tmdb_popular('movie', 5)
    popular += get_tmdb_popular('tv', 5)
    print(f'[ARABIC] {len(popular)} TMDB titles to search')

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox'],
            )
            page = browser.new_page(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
            )

            for item in popular:
                tid = item['id']
                title = item['title']
                query = title.replace(' ', '+')
                search_url = config['search_url'].replace('{query}', query)
                print(f'  [{tid}] Searching "{title}"...')

                try:
                    page.goto(search_url, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(3)

                    links = list(set(
                        a.get_attribute('href') for a in page.query_selector_all('a[href*="/watch"], a[href*="/episode"], a[href*="/movie"], a[href*="/film"], a[href*="/series"], a[href*="/مسلسل"], a[href*="/فيلم"]')
                        if a.get_attribute('href')
                    ))

                    found = 0
                    for link in links[:3]:
                        if not link.startswith('http'):
                            link = f'https://{name}{link}'
                        try:
                            page.goto(link, wait_until='domcontentloaded', timeout=30000)
                            time.sleep(2)

                            for selector in ['iframe', 'video', 'source']:
                                elements = page.query_selector_all(selector)
                                for el in elements:
                                    src = el.get_attribute('src')
                                    if src and src.startswith('http') and not any(ad in src for ad in ['doubleclick', 'googlead', 'popunder', 'dtscout']):
                                        print(f'      STREAM: {src[:120]}...')
                                        if '.m3u8' in src:
                                            saved = save_all_qualities(tid, link, src, category, title)
                                            found += saved
                                            total += saved
                                        else:
                                            save_link(tid, link, src, category, title)
                                            found += 1
                                            total += 1
                        except:
                            pass

                    if found > 0:
                        print(f'    Found {found} stream(s)')
                except Exception as e:
                    print(f'    Error: {e}')

                time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[ARABIC] Fatal: {e}')

    log_result(base_url, category, total)
    print(f'[ARABIC] {name}: {total} streams')
    return total
