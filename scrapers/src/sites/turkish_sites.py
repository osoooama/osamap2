import re, os, sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from curl_cffi import requests as cffi
import jsbeautifier
from bs4 import BeautifulSoup
from sites.base import save_link, save_all_qualities, log_result

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'

HDFILM_DOMAINS = [
    'hdfilmcehennemi.tech',
    'hdfilmcehennemi.sh',
    'hdfilmcehennemi.nl',
    'hdfilmcehennemi.ws',
    'hdfilmcehennemi.mobi',
    'hdfilmcehennemi.com',
    'hdfilmcehennemi.org',
    'hdfilmcehennemi.me',
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}


def find_active_domain():
    for domain in HDFILM_DOMAINS:
        try:
            resp = cffi.get(f'https://{domain}', impersonate='chrome', timeout=10,
                           headers=HEADERS, allow_redirects=True)
            if resp.status_code == 200 and len(resp.text) > 5000:
                final_domain = resp.url.split('/')[2] if '://' in resp.url else domain
                print(f'[HDFILM] Domain {domain} -> {final_domain}')
                return f'https://{final_domain}'
        except Exception:
            pass
    return f'https://{HDFILM_DOMAINS[0]}'


def get_tmdb_popular(media_type='movie', count=10):
    ids = []
    for page_num in range(1, 4):
        url = f'{TMDB_BASE}/{media_type}/popular?api_key={TMDB_API_KEY}&language=tr&page={page_num}'
        try:
            resp = cffi.get(url, impersonate='chrome', timeout=10)
            if resp.ok:
                for item in resp.json().get('results', []):
                    ids.append({
                        'id': item['id'],
                        'title': item.get('title') or item.get('name', ''),
                        'name': item.get('name', ''),
                        'year': (item.get('release_date') or '')[:4],
                        'media_type': media_type,
                    })
            if len(ids) >= count:
                break
        except Exception:
            pass
    return ids[:count]


def search_tmdb(title):
    if not title or len(title) < 3:
        return None
    try:
        resp = cffi.get(f'{TMDB_BASE}/search/multi?api_key={TMDB_API_KEY}&language=tr&query={title[:50]}',
                        impersonate='chrome', timeout=10)
        if resp.ok:
            results = resp.json().get('results', [])
            for r in results:
                if r.get('media_type') in ('movie', 'tv'):
                    return str(r['id'])
            if results:
                return str(results[0]['id'])
    except Exception:
        pass
    return None


def extract_stream_from_eval_js(html_text):
    beautified = jsbeautifier.beautify(html_text)
    m3u8 = re.search(r'(https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*)', beautified)
    if m3u8:
        return m3u8.group(1)
    mp4 = re.search(r'(https?://[^\s"\'<>]+\.mp4[^\s"\'<>]*)', beautified)
    if mp4:
        return mp4.group(1)
    m3u8_raw = re.search(r'(https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*)', html_text)
    if m3u8_raw:
        return m3u8_raw.group(1)
    mp4_raw = re.search(r'(https?://[^\s"\'<>]+\.mp4[^\s"\'<>]*)', html_text)
    if mp4_raw:
        return mp4_raw.group(1)
    return None


def extract_stream_from_page(base_url, page_url):
    try:
        resp = cffi.get(page_url, impersonate='chrome', timeout=15, headers=HEADERS)
        if not resp.ok:
            return None, ''

        soup = BeautifulSoup(resp.text, 'lxml')
        title_el = soup.select_one('h1, h2, .title, .film-title, .entry-title')
        title = title_el.get_text(strip=True) if title_el else ''

        iframes = soup.select('iframe')
        for ifr in iframes:
            src = ifr.get('src', '')
            if not src:
                continue
            if not src.startswith('http'):
                src = f'{base_url}{src}' if src.startswith('/') else src

            iframe_resp = cffi.get(src, impersonate='chrome', timeout=15,
                                   headers={**HEADERS, 'Referer': page_url})
            if iframe_resp.ok:
                stream = extract_stream_from_eval_js(iframe_resp.text)
                if stream:
                    return stream, title

        stream = extract_stream_from_eval_js(resp.text)
        if stream:
            return stream, title

        for s in soup.select('script'):
            text = s.get_text()
            if 'file' in text.lower() or 'player' in text.lower():
                stream = extract_stream_from_eval_js(text)
                if stream:
                    return stream, title

    except Exception as e:
        print(f'    Error: {e}')
    return None, ''


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'turkish')
    print(f'[TURKISH] Starting crawl for {name}...')

    base_url = find_active_domain()
    total = 0

    try:
        movie_links = set()
        popular = get_tmdb_popular('movie', 15)

        main_resp = cffi.get(base_url, impersonate='chrome', timeout=20, headers=HEADERS)
        if main_resp.ok:
            main_soup = BeautifulSoup(main_resp.text, 'lxml')
            for a in main_soup.select('main a[href], .content a[href], #content a[href]'):
                href = a.get('href', '')
                if href and href.startswith('/') and len(href) > 5:
                    text = a.get_text(strip=True)
                    if text and len(text) > 3:
                        movie_links.add((href, text))

        print(f'[HDFILM] Found {len(movie_links)} links from homepage')

        for href, link_title in list(movie_links)[:15]:
            if not href.startswith('http'):
                full_url = f'{base_url}{href}'
            else:
                full_url = href

            try:
                stream_url, page_title = extract_stream_from_page(base_url, full_url)
                title = page_title or link_title

                if stream_url:
                    tmdb_id = search_tmdb(title)
                    print(f'    [{title[:40]}] Stream: {stream_url[:80]}...')
                    if '.m3u8' in stream_url:
                        save_all_qualities(tmdb_id or full_url, full_url, stream_url, category, title)
                        total += 1
                    else:
                        save_link(tmdb_id or full_url, full_url, stream_url, category, title)
                        total += 1

            except Exception as e:
                print(f'    Error: {e}')

            time.sleep(0.5)

    except Exception as e:
        print(f'[HDFILM] Fatal: {e}')

    log_result(base_url, category, total)
    print(f'[TURKISH] hdfilmcehennemi: {total} streams')
    return total
