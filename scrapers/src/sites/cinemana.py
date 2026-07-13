import time, re, json, os, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from playwright.sync_api import sync_playwright
from sites.base import save_link, log_result
import requests

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')

BASE = 'https://cinemana.cc'

CATEGORIES = [
    {'slug': 'أفلام-أجنبي', 'category': 'foreign', 'label': 'Foreign Movies'},
    {'slug': 'مسلسلات-أجنبي', 'category': 'foreign', 'label': 'Foreign Series'},
    {'slug': 'مسلسلات-تركية', 'category': 'turkish', 'label': 'Turkish Series'},
    {'slug': 'أفلام-عربية', 'category': 'arabic', 'label': 'Arabic Movies'},
    {'slug': 'مسلسلات-عربية', 'category': 'arabic', 'label': 'Arabic Series'},
]

SERVER_URL = f'{BASE}/wp-content/themes/EEE/Inc/Ajax/Single/Server.php'

QUALITY_MAP = {'1080': '1080p', '720': '720p', '480': '480p', '360': '360p'}

TMDB_SEARCH = 'https://api.themoviedb.org/3/search/multi'


def search_tmdb(title, api_key=TMDB_API_KEY):
    if not title or len(title) < 3:
        return None
    try:
        resp = requests.get(f'{TMDB_SEARCH}?api_key={api_key}&query={title[:50]}', timeout=10)
        if resp.ok:
            results = resp.json().get('results', [])
            if results:
                return str(results[0]['id'])
    except Exception:
        pass
    return None


def extract_tmdb_id_from_page(page):
    text = page.evaluate('() => document.body.innerText')
    m = re.search(r'tmdb[_:]?\s*(\d{4,8})', text, re.IGNORECASE)
    if m:
        return m.group(1)
    m = re.search(r'themoviedb\.org/[a-z]+/(\d{4,8})', text)
    if m:
        return m.group(1)
    return None


def crawl_category(browser, cat_info, limit=20):
    cat = cat_info['category']
    label = cat_info['label']
    slug = cat_info['slug']
    url = f'{BASE}/watch=category/{slug}/'
    print(f'  [{label}] Fetching {url}...')

    page = browser.new_page()
    total = 0

    try:
        page.goto(url, wait_until='domcontentloaded', timeout=30000)
        time.sleep(3)

        watch_links = list(set(
            a.get_attribute('href')
            for a in page.query_selector_all('a[href*="/watch="]')
        ))
        print(f'    Found {len(watch_links)} items')

        for link in watch_links[:limit]:
            if not link.startswith('http'):
                link = f'{BASE}{link}'

            try:
                page.goto(link, wait_until='domcontentloaded', timeout=30000)
                time.sleep(2)

                post_id = None
                id_match = re.search(r'/watch=(\d+)', page.url)
                if id_match:
                    post_id = id_match.group(1)

                title_el = page.query_selector('h1, h2, .entry-title, .title')
                title = title_el.inner_text().strip() if title_el else post_id or ''

                tmdb_id = extract_tmdb_id_from_page(page)

                if not post_id:
                    continue

                resp = requests.post(SERVER_URL, data={'post_id': post_id}, timeout=15,
                    headers={'User-Agent': 'Mozilla/5.0', 'Referer': link})
                if not resp.ok:
                    continue

                html = resp.text

                m3u8_urls = re.findall(r'(https?://[^"\']+\.m3u8[^"\']*)', html)
                if not m3u8_urls:
                    m3u8_urls = re.findall(r'(https?://[^"\']*(?:scdns\.io|fasel-hd|c\.scdns)[^"\']*)', html)

                if not tmdb_id and title:
                    tmdb_id = search_tmdb(title)

                for stream_url in m3u8_urls:
                    quality = '720p'
                    for res, q in QUALITY_MAP.items():
                        if res in stream_url:
                            quality = q
                            break
                    if stream_url.startswith('http'):
                        print(f'      [{quality}] {stream_url[:80]}...')
                        save_link(tmdb_id or post_id, link, stream_url, cat, title)
                        total += 1

            except Exception as e:
                print(f'    Error on {link}: {e}')

            time.sleep(1)

    except Exception as e:
        print(f'    Category error: {e}')
    finally:
        page.close()

    return total


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'arabic')
    print(f'[CINEMANA] Starting crawl for {name}...')

    total = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'])

            for cat in CATEGORIES:
                if cat['category'] == category or (category == 'arabic' and cat['category'] in ('arabic', 'turkish')):
                    count = crawl_category(browser, cat, limit=15)
                    total += count

            browser.close()
    except Exception as e:
        print(f'[CINEMANA] Fatal: {e}')

    log_result(f'{BASE}/main/', category, total)
    print(f'[CINEMANA] {name}: {total} streams')
    return total
