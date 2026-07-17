import re, os, sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from curl_cffi import requests as cffi
import jsbeautifier
from bs4 import BeautifulSoup
from sites.base import save_link, save_all_qualities, log_result

TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_BASE = 'https://api.themoviedb.org/3'

DIZIPAL_DOMAINS = [
    'dizipal104.vip', 'dizipal105.com', 'dizipal106.com',
    'dizipal107.com', 'dizipal108.com', 'dizipal109.com',
    'dizipal110.com', 'dizipal111.com', 'dizipal112.com',
    'dizipal113.com', 'dizipal114.com', 'dizipal115.com',
    'dizipal116.com', 'dizipal117.com', 'dizipal118.com',
    'dizipal119.com', 'dizipal120.com', 'dizipal121.com',
    'dizipal122.com', 'dizipal123.com', 'dizipal124.com',
    'dizipal125.com', 'dizipal126.com', 'dizipal127.com',
    'dizipal128.com', 'dizipal129.com', 'dizipal130.com',
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}


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


def find_active_domain():
    for domain in DIZIPAL_DOMAINS:
        try:
            resp = cffi.get(f'https://{domain}', impersonate='chrome', timeout=10,
                           headers=HEADERS, allow_redirects=True)
            if resp.status_code == 200 and len(resp.text) > 10000:
                final_domain = resp.url.split('/')[2] if '://' in resp.url else domain
                body_text = BeautifulSoup(resp.text, 'lxml').get_text(strip=True)[:200]
                if 'bilgilendirme' not in body_text.lower():
                    print(f'[DIZIPAL] Domain {domain} -> {final_domain}')
                    return f'https://{final_domain}'
        except Exception:
            pass
    return None


def search_dizipal(base_url, query):
    search_url = f'{base_url}/search/{query.replace(" ", "-")}'
    try:
        resp = cffi.get(search_url, impersonate='chrome', timeout=15, headers=HEADERS)
        if not resp.ok:
            return []

        soup = BeautifulSoup(resp.text, 'lxml')
        results = []
        seen = set()

        for a in soup.select('a[href*="/dizi/"], a[href*="/film/"], a[href*="/series/"]'):
            href = a.get('href', '')
            if href and href not in seen:
                seen.add(href)
                title_el = a.select_one('img, h3, span')
                title = ''
                if title_el:
                    title = title_el.get('alt') or title_el.get_text(strip=True) or ''
                results.append({'url': href, 'title': title.strip()})
        return results[:10]
    except Exception:
        return []


def extract_stream_from_episode(episode_url):
    try:
        resp = cffi.get(episode_url, impersonate='chrome', timeout=15, headers=HEADERS)
        if not resp.ok:
            return '', []

        soup = BeautifulSoup(resp.text, 'lxml')
        title_el = soup.select_one('h1, h2, .title, .entry-title')
        title = title_el.get_text(strip=True) if title_el else ''

        embed_iframe = soup.select_one('#vast_new iframe, .player iframe, iframe[src*="embed"]')
        if not embed_iframe:
            for ifr in soup.select('iframe'):
                src = ifr.get('src', '')
                if 'embed' in src or 'player' in src:
                    embed_iframe = ifr
                    break

        if not embed_iframe:
            url_match = re.search(r'(https?://[^"\'<>\s]+\.(?:m3u8|mp4)(?:[^"\'<>\s]*)?)', resp.text)
            if url_match:
                return title, [url_match.group(1)]
            return title, []

        embed_src = embed_iframe.get('src', '')
        if not embed_src:
            return title, []
        if not embed_src.startswith('http'):
            embed_src = f'https:{embed_src}' if embed_src.startswith('//') else f'{episode_url}{embed_src}'

        embed_resp = cffi.get(embed_src, impersonate='chrome', timeout=15,
                             headers={**HEADERS, 'Referer': episode_url})
        if not embed_resp.ok:
            return title, []

        beautified = jsbeautifier.beautify(embed_resp.text)
        for pattern in [r'file\s*[:=]\s*["\']([^"\']+)', r'source\s*[:=]\s*["\']([^"\']+)']:
            m = re.search(pattern, beautified)
            if m:
                return title, [m.group(1)]

        url_match = re.search(r'(https?://[^"\'\s]+\.(?:m3u8|mp4)(?:[^"\'\s]*)?)', beautified)
        if url_match:
            return title, [url_match.group(1)]

        return title, []
    except Exception:
        return '', []


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'turkish')
    print(f'[DIZIPAL] Starting crawl for {name}...')

    base_url = find_active_domain()
    if not base_url:
        print(f'[DIZIPAL] No accessible domain found')
        log_result('dizipal', category, 0, error='No accessible domain')
        return 0

    print(f'[DIZIPAL] Using domain: {base_url}')

    popular = get_tmdb_popular('tv', 15)
    print(f'[DIZIPAL] {len(popular)} TMDB TV titles to search')

    total = 0
    for item in popular:
        tid = item['id']
        title = item['title'] or item['name']
        print(f'  [{tid}] Searching "{title}"...')

        results = search_dizipal(base_url, title)
        if not results:
            time.sleep(0.5)
            continue

        for result in results[:2]:
            page_url = result['url']
            if not page_url.startswith('http'):
                page_url = f'{base_url}{page_url}'

            try:
                page_resp = cffi.get(page_url, impersonate='chrome', timeout=15, headers=HEADERS)
                if not page_resp.ok:
                    continue

                soup = BeautifulSoup(page_resp.text, 'lxml')
                ep_links = [a.get('href') for a in soup.select('a[href*="/bolum/"], a[href*="/episode/"]')]
                ep_links = [l for l in ep_links if l]

                if not ep_links:
                    ep_title, stream_urls = extract_stream_from_episode(page_url)
                    for stream_url in stream_urls:
                        if stream_url:
                            print(f'    [STREAM] {title}: {stream_url[:80]}...')
                            if '.m3u8' in stream_url:
                                saved = save_all_qualities(tid, page_url, stream_url, category, title)
                                total += saved
                            else:
                                save_link(tid, page_url, stream_url, category, title)
                                total += 1
                else:
                    for ep_link in ep_links[:5]:
                        if not ep_link.startswith('http'):
                            ep_link = f'{base_url}{ep_link}'
                        ep_title, stream_urls = extract_stream_from_episode(ep_link)
                        for stream_url in stream_urls:
                            if stream_url:
                                print(f'    [STREAM] {title}: {stream_url[:80]}...')
                                if '.m3u8' in stream_url:
                                    saved = save_all_qualities(tid, ep_link, stream_url, category, title)
                                    total += saved
                                else:
                                    save_link(tid, ep_link, stream_url, category, title)
                                    total += 1
                        time.sleep(0.5)
            except Exception as e:
                print(f'    Error: {e}')
            time.sleep(0.5)

    log_result(base_url, category, total)
    print(f'[DIZIPAL] {name}: {total} streams')
    return total
