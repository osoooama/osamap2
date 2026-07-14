import time, re, json, os, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from sites.base import save_link, log_result
import requests

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'

ANIME_TMDB_IDS = [
    {'id': 37854, 'title': 'One Piece', 'media_type': 'tv'},
    {'id': 1429, 'title': 'Attack on Titan', 'media_type': 'tv'},
    {'id': 81319, 'title': 'Jujutsu Kaisen', 'media_type': 'tv'},
    {'id': 20, 'title': 'Naruto', 'media_type': 'tv'},
    {'id': 85937, 'title': 'Demon Slayer', 'media_type': 'tv'},
    {'id': 1103, 'title': 'Naruto Shippuden', 'media_type': 'tv'},
    {'id': 82307, 'title': 'Hunter x Hunter', 'media_type': 'tv'},
    {'id': 89337, 'title': 'One Punch Man', 'media_type': 'tv'},
    {'id': 100166, 'title': 'Solo Leveling', 'media_type': 'tv'},
    {'id': 92535, 'title': 'Blue Lock', 'media_type': 'tv'},
]


def get_tmdb_popular(media_type='tv', count=5):
    ids = []
    for page in range(1, 4):
        url = f'{TMDB_BASE}/{media_type}/popular?api_key={TMDB_API_KEY}&language=ar&page={page}&with_original_language=ja'
        try:
            resp = requests.get(url, timeout=10)
            if resp.ok:
                for item in resp.json().get('results', []):
                    ids.append({'id': item['id'], 'title': item.get('name', item.get('title', '')), 'media_type': media_type})
                if len(ids) >= count:
                    break
        except Exception:
            pass
    return ids[:count]


def slugify(title):
    return title.lower().replace(' ', '-').replace(':', '').replace('--', '-').strip('-')


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'anime')
    base_url = f'https://{name}'
    print(f'[ANIME3RB-v2] Starting enhanced crawl for {name}...')

    targets = get_tmdb_popular('tv', 5)
    seen_ids = set()
    for t in ANIME_TMDB_IDS:
        if t['id'] not in seen_ids:
            targets.append(t)
            seen_ids.add(t['id'])

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
            page = browser.new_page()

            for item in targets:
                tid = item['id']
                title = item['title']
                slug = slugify(title)
                ep_url = f'{base_url}/episode/{slug}/1'
                print(f'  [{tid}] {title} -> {slug}')

                try:
                    page.goto(ep_url, wait_until='domcontentloaded', timeout=20000)
                    time.sleep(3)

                    if '404' in page.title() or page.query_selector('text=غير موجود'):
                        print(f'    Episode 1 not found, trying title page')
                        title_url = f'{base_url}/titles/{slug}'
                        page.goto(title_url, wait_until='domcontentloaded', timeout=20000)
                        time.sleep(2)
                        ep_links = [a.get_attribute('href') for a in page.query_selector_all('a[href*="/episode/"]') if a.get_attribute('href')]
                        if not ep_links:
                            print(f'    No episodes found')
                            continue
                        ep_url = ep_links[0] if ep_links[0].startswith('http') else f'{base_url}{ep_links[0]}'
                        page.goto(ep_url, wait_until='domcontentloaded', timeout=20000)
                        time.sleep(3)

                    iframe_el = page.query_selector('iframe[src*="vid3rb"]')
                    if iframe_el:
                        player_src = iframe_el.get_attribute('src')
                        print(f'    Player iframe: {player_src[:80]}...')

                        player_page = browser.new_page()
                        try:
                            player_page.goto(player_src, wait_until='domcontentloaded', timeout=30000)
                            time.sleep(5)

                            sources_json = player_page.evaluate("""
                                () => {
                                    try {
                                        return JSON.stringify(window.video_sources || []);
                                    } catch(e) { return '[]'; }
                                }
                            """)
                            sources = json.loads(sources_json)

                            if sources and len(sources) > 0:
                                for src in sources:
                                    url = src.get('src', '')
                                    label = src.get('label', '720p')
                                    if url and url.startswith('http'):
                                        print(f'    {label}: {url[:80]}...')
                                        save_link(tid, ep_url, url, category, f'{title} - {label}')
                                        total += 1
                            else:
                                video_el = player_page.query_selector('video')
                                if video_el:
                                    video_src = video_el.get_attribute('src') or video_el.get_attribute('currentSrc')
                                    if video_src and video_src.startswith('http'):
                                        print(f'    Video src: {video_src[:80]}...')
                                        save_link(tid, ep_url, video_src, category, title)
                                        total += 1

                            m3u8_list = player_page.evaluate("""
                                () => performance.getEntriesByType('resource')
                                    .map(e => e.name)
                                    .filter(n => n.includes('.m3u8') || n.includes('.mp4'))
                            """)
                            for m3u8 in m3u8_list:
                                if m3u8.startswith('http'):
                                    print(f'    m3u8: {m3u8[:80]}...')
                                    save_link(tid, ep_url, m3u8, category, title)
                                    total += 1

                        except Exception as e:
                            print(f'    Player page error: {e}')
                        finally:
                            player_page.close()
                    else:
                        print(f'    No vid3rb iframe found')

                except Exception as e:
                    print(f'    Error: {e}')

                time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[ANIME3RB-v2] Fatal: {e}')

    log_result(base_url, category, total)
    print(f'[ANIME3RB-v2] {name}: {total} streams')
    return total
