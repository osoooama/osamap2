import os
import time
import requests

from playwright.sync_api import sync_playwright

from sites.base import save_link, log_result

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'


def get_tmdb_popular(media_type='movie', count=20):
    ids = []
    for page in range(1, 4):
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
    category = site_info.get('category', 'foreign')
    base_url = f'https://{name}'
    print(f'[CINEBY] Crawling {name} via play.xpass.top...')

    popular = get_tmdb_popular('movie', 10)
    print(f'[CINEBY] {len(popular)} movies to check')

    total_streams = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox'],
            )
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
            )
            page = context.new_page()

            for item in popular:
                tid = item['id']
                title = item['title']
                player_url = f'https://play.xpass.top/e/movie/{tid}'

                print(f'  [{tid}] {title}...')
                streams = []

                try:
                    page.goto(player_url, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(2)

                    cookies = context.cookies()
                    sess = requests.Session()
                    for c in cookies:
                        sess.cookies.set(c['name'], c['value'])

                    data_url = f'https://play.xpass.top/data/movie/{tid}?autostart=false'
                    dr = sess.get(data_url, headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
                        'Referer': player_url,
                        'Accept': 'application/json',
                    })

                    if dr.ok:
                        sources = dr.json()
                        if isinstance(sources, list):
                            for src in sources[:3]:
                                p_path = src.get('url', '')
                                if not p_path:
                                    continue
                                p_url = f'https://play.xpass.top{p_path}'
                                pr = sess.get(p_url, headers={
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                    'Referer': player_url,
                                    'Accept': 'application/json',
                                })
                                if pr.ok:
                                    pl_data = pr.json()
                                    for entry in pl_data.get('playlist', []):
                                        for s in entry.get('sources', []):
                                            f_url = s.get('file', '')
                                            if f_url and '/video/error' not in f_url:
                                                streams.append(f_url)
                                                save_link(tid, player_url, f_url, category, title)

                    if streams:
                        print(f'    Found {len(streams)} stream(s)')
                        total_streams += len(streams)
                except Exception as e:
                    print(f'    Error: {e}')

                time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[CINEBY] Fatal error: {e}')

    log_result(base_url, category, total_streams)
    print(f'[CINEBY] {name}: {total_streams} streams')
    return total_streams
