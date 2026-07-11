import time
from playwright.sync_api import sync_playwright
from sites.base import save_link, log_result

SITE_CONFIGS = {
    'mycima.video': {
        'search_url': 'https://mycima.video/search/{query}',
        'category': 'arabic',
    },
    'eegebest.com': {
        'search_url': 'https://eegebest.com/search/{query}',
        'category': 'arabic',
    },
    'fajer.show': {
        'search_url': 'https://fajer.show/search/{query}',
        'category': 'arabic',
    },
    '3iskk.xyz': {
        'search_url': 'https://3iskk.xyz/search/{query}',
        'category': 'arabic',
    },
    '7obtv.co': {
        'search_url': 'https://7obtv.co/search/{query}',
        'category': 'arabic',
    },
    'dizipal2085.com': {
        'search_url': 'https://dizipal2085.com/search/{query}',
        'category': 'turkish',
    },
}


def search_and_extract(site_info, query='فلم', tmdb_id='', title=''):
    name = site_info['name']
    category = site_info.get('category', 'arabic')
    config = SITE_CONFIGS.get(name)
    if not config:
        return 0

    search_url = config['search_url'].replace('{query}', query)
    print(f'  Searching {name}: {search_url}')

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox'],
            )
            page = browser.new_page(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
            )
            page.goto(search_url, wait_until='domcontentloaded', timeout=30000)
            time.sleep(3)

            links = list(set(
                a.get_attribute('href') for a in page.query_selector_all('a[href*="/watch"], a[href*="/episode"], a[href*="/movie"], a[href*="/film"], a[href*="/series"], a[href*="/مسلسل"], a[href*="/فيلم"]')
                if a.get_attribute('href')
            ))

            count = 0
            for link in links[:5]:
                if not link.startswith('http'):
                    link = f'https://{name}{link}'
                print(f'    Link: {link[:100]}')
                try:
                    page.goto(link, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(3)

                    iframes = page.query_selector_all('iframe')
                    for iframe in iframes:
                        src = iframe.get_attribute('src')
                        if src and src.startswith('http') and not any(ad in src for ad in ['doubleclick', 'googlead', 'popunder']):
                            print(f'      EMBED: {src[:120]}...')
                            save_link(tmdb_id, link, src, category, title)
                            count += 1

                    videos = page.query_selector_all('video')
                    for video in videos:
                        src = video.get_attribute('src')
                        if src and src.startswith('http'):
                            print(f'      VIDEO: {src[:120]}...')
                            save_link(tmdb_id, link, src, category, title)
                            count += 1

                    sources = page.query_selector_all('source')
                    for source in sources:
                        src = source.get_attribute('src')
                        if src and src.startswith('http'):
                            print(f'      SOURCE: {src[:120]}...')
                            save_link(tmdb_id, link, src, category, title)
                            count += 1
                except:
                    pass

            browser.close()
            return count
    except Exception as e:
        print(f'  Error: {e}')
        return 0


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'arabic')
    base_url = f'https://{name}'
    print(f'[ARABIC] Crawling {name}...')

    queries = ['فلم', 'مسلسل', 'movie', 'series']
    total = 0
    for q in queries:
        total += search_and_extract(site_info, q, '', '')

    log_result(base_url, category, total)
    print(f'[ARABIC] {name}: {total} streams')
    return total
