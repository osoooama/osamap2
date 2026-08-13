import time
import requests
from playwright.sync_api import sync_playwright
from sites.base import save_link, save_all_qualities, log_result, get_tmdb_popular

CLASSIC_IDS = [278, 238, 680, 550, 155, 497, 424, 807, 27205, 157336,
               1892, 1359, 122, 11, 1891, 4977, 121, 429, 98]


def get_popular_ids(media_type='movie', count=10):
    ids = []
    for page in range(1, 5):
        try:
            items = get_tmdb_popular(language='ar', page=page)
            for item in items:
                ids.append({
                    'id': item['id'],
                    'title': item.get('title') or item.get('name', ''),
                    'year': (item.get('release_date') or '')[:4],
                    'media_type': media_type,
                })
            if len(ids) >= count:
                break
        except Exception as e:
            print(f'[STREAMEX] TMDB page {page} error: {e}')
    return ids[:count]


def extract_stream_from_xpass(page, xpass_url):
    for attempt in range(3):
        try:
            page.goto(xpass_url, wait_until='domcontentloaded', timeout=30000)
            page.wait_for_load_state('networkidle', timeout=15000)
            page.wait_for_timeout(3000)

            m3u8 = page.evaluate(
                "() => performance.getEntriesByType('resource').map(e => e.name).filter(n => n.includes('.m3u8'))"
            )
            if m3u8:
                return m3u8[0]

            video = page.query_selector('video')
            if video:
                src = video.get_attribute('src') or video.get_attribute('currentSrc')
                if src and '.m3u8' in src:
                    return src
        except Exception as e:
            print(f'    [XPASS] Attempt {attempt + 1} error: {e}')
        page.wait_for_timeout(2000)
    return None


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'foreign')
    base_url = f'https://{name}/watch'
    print(f'[STREAMEX] Crawling {name} (category={category})...')

    popular = get_popular_ids('movie', 5)
    for cid in CLASSIC_IDS:
        if cid not in [p['id'] for p in popular]:
            popular.append({'id': cid, 'title': '', 'year': '', 'media_type': 'movie'})
    print(f'[STREAMEX] Got {len(popular)} TMDB IDs')

    total = 0
    browser = None
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
                    page.wait_for_timeout(4000)

                    iframes = page.query_selector_all('iframe')
                    xpass_src = None
                    for f in iframes:
                        src = f.get_attribute('src')
                        if src and 'xpass' in src:
                            xpass_src = src
                            break

                    if xpass_src:
                        print(f'    xpass iframe: {xpass_src[:100]}')
                        stream_url = extract_stream_from_xpass(page, xpass_src)
                        if stream_url:
                            print(f'    STREAM: {stream_url[:100]}...')
                            saved = save_all_qualities(tid, watch_url, stream_url, category, title)
                            if saved:
                                total += saved
                                print(f'    Saved {saved} variant(s)')
                        else:
                            print(f'    Could not extract stream from xpass')
                    else:
                        print(f'    No xpass iframe found')

                except Exception as e:
                    print(f'    Error: {e}')

                page.wait_for_timeout(1000)

    except Exception as e:
        print(f'[STREAMEX] Fatal: {e}')
    finally:
        if browser:
            browser.close()

    log_result(base_url, category, total)
    print(f'[STREAMEX] {name}: {total} streams')
    return total
