import time, json, base64
from playwright.sync_api import sync_playwright
from sites.base import save_link, log_result

def decode_href(encoded):
    try:
        key = "asxwqa147"
        decoded = base64.b64decode(encoded).decode('latin-1')
        result = ''.join(chr(ord(decoded[i]) ^ ord(key[i % len(key)])) for i in range(len(decoded)))
        return result
    except:
        return ''

def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'anime')
    base_url = f'https://{name}'
    print(f'[ANIMESLAYER] Starting crawl for {name}...')

    POPULAR_TITLES = [
        'bleach-byt', 'one-piece-byw', 'naruto-byh', 'naruto-shippuuden-byv',
        'jujutsu-kaisen-cly', 'kimetsu-no-yaiba-cbx', 'shingeki-no-kyojin-bzw',
        'hunter-x-hunter-2011-agk', 'black-clover-ccb', 'solo-leveling-fwz',
    ]

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
            page = browser.new_page(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36')

            for slug in POPULAR_TITLES:
                title_url = f'{base_url}/title/{slug}'
                print(f'  Title: {slug} -> {title_url}')
                try:
                    page.goto(title_url, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(3)

                    cards = page.query_selector_all('div.ep-card')
                    print(f'    Episodes found: {len(cards)}')

                    for card in cards[:5]:
                        encoded = card.get_attribute('data-href') or ''
                        href = decode_href(encoded)
                        if not href:
                            continue
                        watch_url = f'{base_url}{href}'
                        print(f'    Watch: {watch_url}')
                        try:
                            page.goto(watch_url, wait_until='domcontentloaded', timeout=30000)
                            time.sleep(4)

                            iframes = page.query_selector_all('iframe')
                            player_src = ''
                            for f in iframes:
                                src = f.get_attribute('src') or ''
                                fid = f.get_attribute('id') or ''
                                if 'player' in fid or 'p_wit' in src:
                                    player_src = src
                                    break
                            if not player_src and iframes:
                                player_src = iframes[0].get_attribute('src') or ''

                            if player_src:
                                print(f'      Player: {player_src[:80]}...')
                                try:
                                    player_page = browser.new_page()
                                    player_page.goto(player_src, wait_until='domcontentloaded', timeout=30000)
                                    time.sleep(3)

                                    m3u8s = player_page.evaluate(
                                        "() => performance.getEntriesByType('resource').map(e => e.name).filter(n => n.includes('.m3u8'))"
                                    )
                                    for m3u8 in m3u8s:
                                        if m3u8.startswith('http'):
                                            print(f'      STREAM: {m3u8[:80]}')
                                            save_link(None, watch_url, m3u8, category, slug)
                                            total += 1
                                    player_page.close()
                                except Exception as e:
                                    print(f'      Player error: {e}')
                            else:
                                sources = page.query_selector_all('source')
                                for s in sources:
                                    src = s.get_attribute('src') or ''
                                    if src.startswith('http'):
                                        print(f'      STREAM: {src[:80]}')
                                        save_link(None, watch_url, src, category, slug)
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
