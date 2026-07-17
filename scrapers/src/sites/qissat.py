import re, os, sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from curl_cffi import requests as cffi
import jsbeautifier
from bs4 import BeautifulSoup
from sites.base import save_link, save_all_qualities, log_result

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'
BASE = 'https://ar.qissat.tv'

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ar,en;q=0.5',
}


def get_tmdb_popular(media_type='movie', count=10):
    ids = []
    for page_num in range(1, 4):
        url = f'{TMDB_BASE}/{media_type}/popular?api_key={TMDB_API_KEY}&language=ar&page={page_num}'
        try:
            resp = cffi.get(url, impersonate='chrome', timeout=10)
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
        except Exception:
            pass
    return ids[:count]


def search_qissat(query):
    from urllib.parse import quote
    search_url = f'{BASE}/search.php?keywords={quote(query)}'
    try:
        resp = cffi.get(search_url, impersonate='chrome', timeout=15, headers=HEADERS)
        if not resp.ok:
            return []

        soup = BeautifulSoup(resp.text, 'lxml')
        results = []

        for a in soup.select('a[href*="watch.php"], a[href*="/video/"]'):
            href = a.get('href', '')
            if href and 'watch' in href or 'video' in href:
                if not href.startswith('http'):
                    href = f'{BASE}{href}'
                text = a.get_text(strip=True)[:50]
                if text:
                    results.append({'url': href, 'title': text})

        if not results:
            for a in soup.select('a[href]'):
                href = a.get('href', '')
                text = a.get_text(strip=True)
                if text and len(text) > 3 and ('watch' in href or 'video' in href):
                    if not href.startswith('http'):
                        href = f'{BASE}{href}'
                    results.append({'url': href, 'title': text[:50]})

        return results[:10]
    except Exception:
        return []


def extract_stream_from_page(watch_url):
    try:
        resp = cffi.get(watch_url, impersonate='chrome', timeout=15, headers=HEADERS)
        if not resp.ok:
            return '', []

        soup = BeautifulSoup(resp.text, 'lxml')
        title_el = soup.select_one('h1, h2, .title, .video-title, .entry-title')
        title = title_el.get_text(strip=True) if title_el else ''

        embed_urls = []
        for ifr in soup.select('iframe[src]'):
            src = ifr.get('src', '')
            if src:
                if not src.startswith('http'):
                    src = f'https:{src}' if src.startswith('//') else f'{BASE}{src}'
                embed_urls.append(src)

        for script in soup.select('script'):
            text = script.get_text()
            hash_matches = re.findall(r'hash=([^&"\'<>]+)', text)
            for hash_val in hash_matches:
                try:
                    import base64
                    decoded = base64.b64decode(hash_val).decode('utf-8', errors='ignore')
                    urls = re.findall(r'https?://[^\s"\'<>]+', decoded)
                    embed_urls.extend(urls)
                except Exception:
                    pass

        m3u8_in_page = re.findall(r'(https?://[^"\'<>\s]+\.m3u8(?:[^"\'<>\s]*)?)', resp.text)
        if m3u8_in_page:
            return title, m3u8_in_page

        mp4_in_page = re.findall(r'(https?://[^"\'<>\s]+\.mp4(?:[^"\'<>\s]*)?)', resp.text)
        if mp4_in_page:
            return title, mp4_in_page

        return title, embed_urls
    except Exception:
        return '', []


def extract_stream_from_embed(embed_url):
    try:
        resp = cffi.get(embed_url, impersonate='chrome', timeout=15, headers=HEADERS)
        if not resp.ok:
            return None

        beautified = jsbeautifier.beautify(resp.text)
        for pattern in [
            r'(?:file|src|source)\s*[:=]\s*["\']([^"\']+\.m3u8[^"\']*)',
            r'(https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*)',
        ]:
            m = re.search(pattern, beautified)
            if m:
                return m.group(1)

        m3u8_raw = re.search(r'(https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*)', resp.text)
        if m3u8_raw:
            return m3u8_raw.group(1)

        mp4 = re.search(r'(https?://[^\s"\'<>]+\.mp4[^\s"\'<>]*)', resp.text)
        if mp4:
            return mp4.group(1)

    except Exception:
        pass
    return None


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'turkish')
    print(f'[QISSAT] Starting crawl for {name}...')

    popular = get_tmdb_popular('tv', 10)
    popular += get_tmdb_popular('movie', 5)
    print(f'[QISSAT] {len(popular)} TMDB titles to search')

    total = 0
    for item in popular:
        tid = item['id']
        title = item['title']
        print(f'  [{tid}] Searching "{title}"...')

        results = search_qissat(title)
        if not results:
            time.sleep(0.5)
            continue

        for result in results[:3]:
            watch_url = result['url']
            found_title, streams_or_embeds = extract_stream_from_page(watch_url)
            final_title = found_title or result['title'] or title

            for url in streams_or_embeds:
                if '.m3u8' in url or '.mp4' in url:
                    print(f'    [STREAM] {final_title}: {url[:80]}...')
                    if '.m3u8' in url:
                        saved = save_all_qualities(tid, watch_url, url, category, final_title)
                        total += saved
                    else:
                        save_link(tid, watch_url, url, category, final_title)
                        total += 1
                elif url.startswith('http'):
                    stream_url = extract_stream_from_embed(url)
                    if stream_url:
                        print(f'    [STREAM] {final_title}: {stream_url[:80]}...')
                        if '.m3u8' in stream_url:
                            saved = save_all_qualities(tid, watch_url, stream_url, category, final_title)
                            total += saved
                        else:
                            save_link(tid, watch_url, stream_url, category, final_title)
                            total += 1
            time.sleep(0.5)

    log_result(BASE, category, total)
    print(f'[QISSAT] {name}: {total} streams')
    return total
