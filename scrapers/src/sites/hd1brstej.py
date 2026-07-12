import time, re, json, os, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from sites.base import save_link, log_result

BASE = 'https://hd1.brstej.com'

SERVERS = [
    {'name': 'hdup20', 'pattern': 'hdup20'},
    {'name': 'film77', 'pattern': 'film77'},
    {'name': 'hd-vk', 'pattern': 'hd-vk'},
    {'name': 'okru', 'pattern': 'ok.ru'},
]


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'arabic')
    print(f'[HD1] Starting crawl for {name}...')

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
            page = browser.new_page()

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

                    for embed_url in embed_urls:
                        q = '720p'
                        for srv_name, pat in SERVERS:
                            if pat in embed_url:
                                q = srv_name
                                break
                        print(f'    [{q}] {embed_url[:80]}...')
                        save_link(vid, play_url, embed_url, category, title)
                        total += 1

                except Exception as e:
                    print(f'    Error: {e}')

                time.sleep(1)

            browser.close()
    except Exception as e:
        print(f'[HD1] Fatal: {e}')

    log_result(BASE, category, total)
    print(f'[HD1] {name}: {total} streams')
    return total
