import time
import re
import base64

from playwright.sync_api import sync_playwright

from sites.base import save_link, log_result


def decode_anime_slayer_href(encoded):
    try:
        decoded = base64.b64decode(encoded).decode('utf-8')
        return decoded
    except:
        return encoded


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'anime')
    base_url = f'https://{name}'
    print(f'[ANIMESLAYER] Starting crawl for {name}...')

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

            title_links = list(set(
                a.get_attribute('href')
                for a in page.query_selector_all('a[href*="/title/"]')
                if a.get_attribute('href') and '/title/' in a.get_attribute('href')
            ))
            print(f'[ANIMESLAYER] Found {len(title_links)} title links')

            for title_link in title_links[:5]:
                if not title_link.startswith('http'):
                    title_link = f'https://{name}{title_link}'
                print(f'  Opening title: {title_link}')
                try:
                    page.goto(title_link, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(3)

                    ep_hrefs = page.evaluate('''() => {
                        const s = [...document.querySelectorAll('script')];
                        const epScript = s.find(s => s.textContent.includes('const episodes'));
                        if (!epScript) return [];
                        const matches = [...epScript.textContent.matchAll(/href:"([^"]+)"/g)];
                        return matches.map(m => m[1]);
                    }''')

                    print(f'    Found {len(ep_hrefs)} episodes')

                    for ep_href in ep_hrefs[:3]:
                        watch_url = f'https://{name}/watch/{ep_href}'
                        print(f'    Opening watch: {watch_url}')
                        try:
                            page.goto(watch_url, wait_until='domcontentloaded', timeout=30000)
                            time.sleep(3)

                            iframe_el = page.query_selector('iframe[src*="player"]')
                            if iframe_el:
                                player_src = iframe_el.get_attribute('src')
                                print(f'      Player: {player_src[:80]}...')
                                page.goto(player_src, wait_until='domcontentloaded', timeout=30000)
                                time.sleep(2)

                                video_el = page.query_selector('video')
                                if video_el:
                                    video_src = video_el.get_attribute('src') or video_el.get_attribute('currentSrc')
                                    if video_src and video_src.startswith('http'):
                                        print(f'      STREAM: {video_src[:100]}...')
                                        save_link(None, ep_link, video_src, category)
                                        total_streams += 1

                            sources = page.query_selector_all('source')
                            for source in sources:
                                src = source.get_attribute('src')
                                if src and src.startswith('http'):
                                    print(f'      SOURCE: {src[:100]}...')
                                    save_link(None, watch_url, src, category)
                                    total_streams += 1
                        except Exception as e:
                            print(f'      Error: {e}')
                except Exception as e:
                    print(f'    Error on {title_link}: {e}')

            browser.close()
    except Exception as e:
        print(f'[ANIMESLAYER] Crawl error: {e}')

    log_result(base_url, category, total_streams)
    print(f'[ANIMESLAYER] {name}: {total_streams} streams found')
    return total_streams
