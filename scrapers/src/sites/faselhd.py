import re
import time
from curl_cffi import requests as cffi
import jsbeautifier
from bs4 import BeautifulSoup
from sites.base import save_link, save_all_qualities, log_result, get_tmdb_popular, encode_search_query

FASEL_DOMAINS = ['faselhd.club', 'faselhd.ac', 'faselhd.pro', 'faselhd.cam']

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ar,en;q=0.5',
}


def get_popular_ids(media_type='movie', count=10):
    ids = []
    for page_num in range(1, 4):
        try:
            items = get_tmdb_popular(language='ar', page=page_num)
            for item in items:
                ids.append({
                    'id': item['id'],
                    'title': item.get('title') or item.get('name', ''),
                    'year': (item.get('release_date') or '')[:4],
                    'media_type': media_type,
                })
            if len(ids) >= count:
                break
        except Exception as e:
            print(f'[FASELHD] TMDB page {page_num} error: {e}')
    return ids[:count]


def search_fasel(base_url, query):
    search_url = f'{base_url}/?s={encode_search_query(query)}'
    try:
        resp = cffi.get(search_url, impersonate='chrome', timeout=15, headers=HEADERS)
        if not resp.ok:
            return []

        soup = BeautifulSoup(resp.text, 'lxml')
        results = []
        seen = set()

        for a in soup.select('a[href]'):
            href = a.get('href', '')
            if '/?p=' in href and href not in seen:
                seen.add(href)
                img = a.select_one('img')
                title = img.get('alt', '') if img else a.get_text(strip=True)[:50]
                results.append({'url': href, 'title': title})
        return results[:10]
    except Exception:
        return []


def extract_stream_from_embed(embed_url):
    for attempt in range(2):
        try:
            resp = cffi.get(embed_url, impersonate='chrome', timeout=15,
                           headers={**HEADERS, 'Referer': 'https://faselhd.club/'})
            if not resp.ok:
                continue

            stream = None
            beautified = jsbeautifier.beautify(resp.text)
            m3u8 = re.search(r'(https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*)', beautified)
            if m3u8:
                stream = m3u8.group(1)
            if not stream:
                mp4 = re.search(r'(https?://[^\s"\'<>]+\.mp4[^\s"\'<>]*)', beautified)
                if mp4:
                    stream = mp4.group(1)
            if not stream:
                m3u8_raw = re.search(r'(https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*)', resp.text)
                if m3u8_raw:
                    stream = m3u8_raw.group(1)
            if stream:
                return stream

            soup = BeautifulSoup(resp.text, 'lxml')
            for ifr in soup.select('iframe'):
                src = ifr.get('src', '')
                if src.startswith('http'):
                    inner = extract_stream_from_embed(src)
                    if inner:
                        return inner

        except Exception as e:
            print(f'    [EMBED ERROR] {e}')
        if attempt < 1:
            time.sleep(1)
    return None


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'arabic')
    print(f'[FASELHD] Starting crawl for {name}...')

    base_url = None
    for domain in FASEL_DOMAINS:
        try:
            resp = cffi.get(f'https://{domain}', impersonate='chrome', timeout=10,
                           headers=HEADERS, allow_redirects=True)
            if resp.status_code == 200 and 'fasel' in resp.text[:2000].lower():
                base_url = f'https://{domain}'
                break
        except Exception as e:
            print(f'[FASELHD] Domain {domain} error: {e}')

    if not base_url:
        print(f'[FASELHD] No accessible domain found')
        log_result('faselhd', category, 0, error='No accessible domain')
        return 0

    print(f'[FASELHD] Using domain: {base_url}')

    popular = get_popular_ids('movie', 10)
    popular += get_popular_ids('tv', 10)
    print(f'[FASELHD] {len(popular)} TMDB titles to search')

    total = 0
    for item in popular:
        tid = item['id']
        title = item['title']
        print(f'  [{tid}] Searching "{title}"...')

        results = search_fasel(base_url, title)
        if not results:
            time.sleep(0.5)
            continue

        for result in results[:3]:
            page_url = result['url']
            if not page_url.startswith('http'):
                page_url = f'{base_url}{page_url}'

            try:
                page_resp = cffi.get(page_url, impersonate='chrome', timeout=15, headers=HEADERS)
                if not page_resp.ok:
                    continue

                soup = BeautifulSoup(page_resp.text, 'lxml')
                title_el = soup.select_one('h1, h2, .entry-title, .title')
                found_title = title_el.get_text(strip=True) if title_el else result['title'] or title

                embed_src = None
                for ifr in soup.select('iframe'):
                    src = ifr.get('src', '')
                    if 'scdns' in src or 'embed' in src or 'player' in src:
                        embed_src = src
                        break
                if not embed_src:
                    for ifr in soup.select('iframe'):
                        src = ifr.get('src', '')
                        if src.startswith('http'):
                            embed_src = src
                            break

                if not embed_src:
                    continue

                if not embed_src.startswith('http'):
                    embed_src = f'https:{embed_src}' if embed_src.startswith('//') else f'https://faselhd-embed.scdns.io{embed_src}'

                stream_url = extract_stream_from_embed(embed_src)
                if stream_url:
                    print(f'    [STREAM] {found_title}: {stream_url[:80]}...')
                    if '.m3u8' in stream_url:
                        saved = save_all_qualities(tid, page_url, stream_url, category, found_title)
                        total += saved
                    else:
                        save_link(tid, page_url, stream_url, category, found_title)
                        total += 1
            except Exception as e:
                print(f'    Error: {e}')
            time.sleep(0.5)

    log_result(base_url, category, total)
    print(f'[FASELHD] {name}: {total} streams')
    return total
