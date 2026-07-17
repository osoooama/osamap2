import time, base64, re, os, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from sites.base import save_link, save_all_qualities, log_result
import requests

ANIMESLAYER_DOMAINS = [
    'animeslayer.to', 'animeslayer.tv', 'animeslayer.cc',
    'animeslayer.net', 'animeslayer.fun', 'animeslayer.app',
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
}


def find_active_domain():
    for domain in ANIMESLAYER_DOMAINS:
        try:
            resp = requests.head(f'https://{domain}', timeout=10, allow_redirects=True, headers=HEADERS)
            final_url = resp.url if hasattr(resp, 'url') else f'https://{domain}'
            if resp.status_code in (200, 301, 302):
                actual_domain = final_url.split('/')[2] if '://' in final_url else domain
                print(f'[ANIMESLAYER] Domain {domain} -> {actual_domain} (status {resp.status_code})')
                return actual_domain, f'https://{actual_domain}'
        except Exception as e:
            print(f'[ANIMESLAYER] Domain {domain} failed: {e}')
            pass
    return 'animeslayer.to', 'https://animeslayer.to'


def decode_href(encoded):
    try:
        key = "asxwqa147"
        decoded = base64.b64decode(encoded).decode('latin-1')
        result = ''.join(chr(ord(decoded[i]) ^ ord(key[i % len(key)])) for i in range(len(decoded)))
        return result
    except Exception:
        return ''


def extract_stream_from_page(page, url):
    try:
        page.goto(url, wait_until='domcontentloaded', timeout=25000)
        time.sleep(3)

        content = page.content()
        for pattern in [
            r'(?:file|src|source)\s*[:=]\s*["\']([^"\']+\.m3u8[^"\']*)',
            r'"(https?://[^"]+\.m3u8[^"]*)"',
        ]:
            m = re.search(pattern, content)
            if m:
                return m.group(1)

        url_match = re.search(r'(https?://[^"\'<>\s]+\.m3u8(?:[^"\'<>\s]*)?)', content)
        if url_match:
            return url_match.group(1)

        iframes = page.query_selector_all('iframe')
        for f in iframes:
            src = f.get_attribute('src') or ''
            if src.startswith('http') and 'animeslayer' not in src:
                return src

        return None
    except Exception:
        return None


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'anime')
    print(f'[ANIMESLAYER] Starting crawl for {name}...')

    actual_name, base_url = find_active_domain()
    print(f'[ANIMESLAYER] Using domain: {base_url}')

    POPULAR_TITLES = [
        'bleach-byt', 'one-piece-byw', 'naruto-byh', 'naruto-shippuuden-byv',
        'jujutsu-kaisen-cly', 'kimetsu-no-yaiba-cbx', 'shingeki-no-kyojin-bzw',
        'hunter-x-hunter-2011-agk', 'black-clover-ccb', 'solo-leveling-fwz',
    ]

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
            context = browser.new_context(
                user_agent=HEADERS['User-Agent'],
                locale='ar',
            )
            page = context.new_page()
            Stealth().apply_stealth_sync(page)

            for slug in POPULAR_TITLES:
                title_url = f'{base_url}/title/{slug}'
                print(f'  Title: {slug} -> {title_url}')
                try:
                    page.goto(title_url, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(3)

                    current_url = page.url
                    if current_url != title_url:
                        print(f'    Redirected to: {current_url}')

                    cards = page.query_selector_all('div.ep-card')
                    if not cards:
                        cards = page.query_selector_all('[data-href], .episode-card, .ep-item, .episode')
                    print(f'    Episodes found: {len(cards)}')

                    for card in cards[:5]:
                        encoded = card.get_attribute('data-href') or ''
                        href = decode_href(encoded) if encoded else ''

                        if not href:
                            a_el = card.query_selector('a')
                            if a_el:
                                href = a_el.get_attribute('href') or ''

                        if not href:
                            continue

                        if href.startswith('http'):
                            watch_url = href
                        else:
                            watch_url = f'{base_url}{href}'
                        print(f'    Watch: {watch_url}')

                        try:
                            page.goto(watch_url, wait_until='domcontentloaded', timeout=30000)
                            time.sleep(3)

                            player_src = ''
                            iframes = page.query_selector_all('iframe')
                            for f in iframes:
                                src = f.get_attribute('src') or ''
                                fid = f.get_attribute('id') or ''
                                if 'player' in fid or 'p_wit' in src or 'embed' in src:
                                    player_src = src
                                    break
                            if not player_src and iframes:
                                player_src = iframes[0].get_attribute('src') or ''

                            if player_src:
                                if not player_src.startswith('http'):
                                    player_src = f'https:{player_src}' if player_src.startswith('//') else f'{base_url}{player_src}'
                                print(f'      Player: {player_src[:80]}...')

                                stream_url = extract_stream_from_page(page, player_src)
                                if stream_url:
                                    print(f'      STREAM: {stream_url[:80]}')
                                    if '.m3u8' in stream_url:
                                        saved = save_all_qualities(None, watch_url, stream_url, category, slug)
                                        total += saved
                                    else:
                                        save_link(None, watch_url, stream_url, category, slug)
                                        total += 1
                            else:
                                page_content = page.content()
                                m3u8_match = re.search(r'(https?://[^"\'<>\s]+\.m3u8(?:[^"\'<>\s]*)?)', page_content)
                                if m3u8_match:
                                    print(f'      STREAM: {m3u8_match.group(1)[:80]}')
                                    save_link(None, watch_url, m3u8_match.group(1), category, slug)
                                    total += 1
                        except Exception as e:
                            print(f'      Error: {e}')
                        time.sleep(1)
                except Exception as e:
                    print(f'    Title error: {e}')

            browser.close()
    except Exception as e:
        print(f'[ANIMESLAYER] Fatal: {e}')

    log_result(base_url, category, total)
    print(f'[ANIMESLAYER] {name}: {total} streams')
    return total
