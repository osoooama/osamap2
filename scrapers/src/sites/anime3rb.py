import time
import re

from playwright.sync_api import sync_playwright

from sites.base import save_link, log_result


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'anime')
    base_url = f'https://{name}'
    print(f'[ANIME3RB] Starting crawl for {name}...')

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
            page.goto(base_url, wait_until='domcontentloaded', timeout=30000)
            time.sleep(3)

            episode_links = list(set(
                a.get_attribute('href')
                for a in page.query_selector_all('a[href*="/episode/"]')
                if a.get_attribute('href')
            ))
            print(f'[ANIME3RB] Found {len(episode_links)} episode links on homepage')

            for ep_link in episode_links[:20]:
                if not ep_link.startswith('http'):
                    ep_link = f'https://{name}{ep_link}'
                print(f'  Opening episode: {ep_link}')
                try:
                    page.goto(ep_link, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(2)

                    iframe_el = page.query_selector('iframe[src*="vid3rb"]')
                    if iframe_el:
                        player_src = iframe_el.get_attribute('src')
                        print(f'    Player iframe: {player_src[:80]}...')

                        page.goto(player_src, wait_until='domcontentloaded', timeout=30000)
                        time.sleep(2)

                        video_el = page.query_selector('video')
                        if video_el:
                            video_src = video_el.get_attribute('src') or video_el.get_attribute('currentSrc')
                            if video_src and video_src.startswith('http'):
                                print(f'    STREAM: {video_src[:100]}...')
                                save_link(None, ep_link, video_src, category)
                                total_streams += 1
                except Exception as e:
                    print(f'    Error on {ep_link}: {e}')

            browser.close()
    except Exception as e:
        print(f'[ANIME3RB] Crawl error: {e}')

    log_result(base_url, category, total_streams)
    print(f'[ANIME3RB] {name}: {total_streams} streams found')
    return total_streams
