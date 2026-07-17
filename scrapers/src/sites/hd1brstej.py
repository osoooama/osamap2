import time, re, os, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from sites.base import save_link, save_all_qualities, log_result
import requests

BASE = 'https://hd1.brstej.com'
TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_SEARCH = 'https://api.themoviedb.org/3/search/multi'

SERVERS = [
    {'name': 'hdup20', 'pattern': 'hdup20'},
    {'name': 'film77', 'pattern': 'film77'},
    {'name': 'hd-vk', 'pattern': 'hd-vk'},
    {'name': 'okru', 'pattern': 'ok.ru'},
]


def search_tmdb(title):
    if not title or len(title) < 3:
        return None
    try:
        resp = requests.get(f'{TMDB_SEARCH}?api_key={TMDB_API_KEY}&language=ar&query={title[:50]}', timeout=10)
        if resp.ok:
            results = resp.json().get('results', [])
            return str(results[0]['id']) if results else None
    except Exception:
        pass
    return None


def extract_stream_from_embed(page, embed_url):
    for attempt in range(2):
        try:
            page.goto(embed_url, wait_until='domcontentloaded', timeout=20000)
            time.sleep(3)

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

            try:
                m3u8s = page.evaluate(
                    "() => performance.getEntriesByType('resource').map(e => e.name).filter(n => n.includes('.m3u8') || n.includes('.mp4'))"
                )
                for url in m3u8s:
                    if url.startswith('http'):
                        return url
            except Exception:
                pass

            iframes = page.query_selector_all('iframe')
            for ifr in iframes:
                src = ifr.get_attribute('src') or ''
                if src.startswith('http') and 'brstej' not in src:
                    inner_stream = extract_stream_from_embed(page, src)
                    if inner_stream:
                        return inner_stream

        except Exception as e:
            print(f'      Embed extract error: {e}')
            if attempt < 1:
                time.sleep(2)

    return None


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'arabic')
    print(f'[HD1] Starting crawl for {name}...')

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
                locale='ar',
            )
            page = context.new_page()
            Stealth().apply_stealth_sync(page)

            page.goto(f'{BASE}/main430', wait_until='domcontentloaded', timeout=30000)
            time.sleep(3)

            series_links = list(set(
                a.get_attribute('href')
                for a in page.query_selector_all('a[href*="series1.php?id="], a[href*="watch.php?vid="]')
            ))
            print(f'[HD1] Found {len(series_links)} series/items')

            for link in series_links[:20]:
                if not link.startswith('http'):
                    link = f'{BASE}{link}'

                try:
                    page.goto(link, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(2)

                    vid = None
                    vid_match = re.search(r'vid=([a-f0-9]{9})', page.url)
                    if vid_match:
                        vid = vid_match.group(1)

                    title_el = page.query_selector('h1, h2, .series-title, .entry-title')
                    title = title_el.inner_text().strip() if title_el else vid or ''

                    if not vid:
                        ep_links = [a.get_attribute('href') for a in page.query_selector_all('a[href*="watch.php?vid="]')]
                        for ep_link in ep_links[:5]:
                            m = re.search(r'vid=([a-f0-9]{9})', ep_link)
                            if m:
                                vid = m.group(1)
                                ep_url = f'{BASE}/watch.php?vid={vid}'
                                page.goto(ep_url, wait_until='domcontentloaded', timeout=30000)
                                time.sleep(2)
                                break

                    if not vid:
                        continue

                    play_url = f'{BASE}/play.php?vid={vid}'
                    page.goto(play_url, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(3)

                    server_btns = page.query_selector_all('#WatchServers button, .server-btn, [data-embed-url]')
                    embed_urls = []

                    for btn in server_btns:
                        embed_url = btn.get_attribute('data-embed-url') or btn.get_attribute('data-src') or btn.get_attribute('href')
                        if embed_url:
                            if not embed_url.startswith('http'):
                                embed_url = f'{BASE}{embed_url}'
                            embed_urls.append(embed_url)

                    if not embed_urls:
                        embed_urls.append(f'{BASE}/embed.php?vid={vid}')

                    tmdb_id = search_tmdb(title)

                    for embed_url in embed_urls:
                        stream_url = extract_stream_from_embed(page, embed_url)
                        if stream_url:
                            q = '720p'
                            for srv in SERVERS:
                                if srv['pattern'] in embed_url:
                                    q = srv['name']
                                    break
                            print(f'    [{q}] {title}: {stream_url[:80]}...')
                            if '.m3u8' in stream_url:
                                saved = save_all_qualities(tmdb_id or vid, play_url, stream_url, category, title)
                                total += saved
                            else:
                                save_link(tmdb_id or vid, play_url, stream_url, category, title)
                                total += 1
                        else:
                            print(f'    [NO STREAM] {embed_url[:80]}...')

                except Exception as e:
                    print(f'    Error: {e}')

                time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[HD1] Fatal: {e}')

    log_result(BASE, category, total)
    print(f'[HD1] {name}: {total} streams')
    return total
