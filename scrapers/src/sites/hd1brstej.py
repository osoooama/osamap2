import re, os, sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from curl_cffi import requests as cffi
import jsbeautifier
from bs4 import BeautifulSoup
from sites.base import save_link, save_all_qualities, log_result

BASE = 'https://hd1.brstej.com'
TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')
TMDB_SEARCH = 'https://api.themoviedb.org/3/search/multi'

SERVERS = [
    {'name': 'hdup20', 'pattern': 'hdup20'},
    {'name': 'film77', 'pattern': 'film77'},
    {'name': 'hd-vk', 'pattern': 'hd-vk'},
    {'name': 'okru', 'pattern': 'ok.ru'},
]


def search_tmdb(title):
    if not title or len(title) < 3:
        return None
    try:
        resp = cffi.get(f'{TMDB_SEARCH}?api_key={TMDB_API_KEY}&language=ar&query={title[:50]}',
                        impersonate='chrome', timeout=10)
        if resp.ok:
            results = resp.json().get('results', [])
            return str(results[0]['id']) if results else None
    except Exception:
        pass
    return None


def extract_stream_from_eval_js(html_text):
    for pattern in [
        r'eval\(function\(p,a,c,k,e,d\)\{.+?\}\((.+?),(\d+),(\d+),\'([^\']+)\'\.split\(\'([^\']*)\'\)\)',
    ]:
        m = re.search(pattern, html_text, re.DOTALL)
        if m:
            try:
                from jsbeautifier import beautify
                beautified = beautify(html_text)
                m3u8 = re.search(r'(https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*)', beautified)
                if m3u8:
                    return m3u8.group(1)
                mp4 = re.search(r'(https?://[^\s"\'<>]+\.mp4[^\s"\'<>]*)', beautified)
                if mp4:
                    return mp4.group(1)
            except Exception:
                pass
    m3u8 = re.search(r'(https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*)', html_text)
    if m3u8:
        return m3u8.group(1)
    mp4 = re.search(r'(https?://[^\s"\'<>]+\.mp4[^\s"\'<>]*)', html_text)
    if mp4:
        return mp4.group(1)
    return None


def extract_stream_from_embed(embed_url):
    for attempt in range(2):
        try:
            resp = cffi.get(embed_url, impersonate='chrome', timeout=15,
                           headers={'Referer': f'{BASE}/', 'Origin': BASE})
            if not resp.ok:
                continue

            stream = extract_stream_from_eval_js(resp.text)
            if stream:
                return stream

            soup = BeautifulSoup(resp.text, 'lxml')
            for ifr in soup.select('iframe'):
                src = ifr.get('src', '')
                if src.startswith('http') and 'brstej' not in src:
                    inner = extract_stream_from_embed(src)
                    if inner:
                        return inner

        except Exception as e:
            print(f'      Embed error: {e}')
        if attempt < 1:
            time.sleep(1)
    return None


def crawl(site_info):
    name = site_info['name']
    category = site_info.get('category', 'arabic')
    print(f'[HD1] Starting crawl for {name}...')

    total = 0
    try:
        resp = cffi.get(f'{BASE}/main430', impersonate='chrome', timeout=20)
        if not resp.ok:
            print(f'[HD1] Failed to load main page: {resp.status_code}')
            log_result(BASE, category, 0, error=f'HTTP {resp.status_code}')
            return 0

        soup = BeautifulSoup(resp.text, 'lxml')
        watch_links = list(set(
            a.get('href', '')
            for a in soup.select('a[href*="watch.php?vid="]')
            if a.get('href')
        ))
        print(f'[HD1] Found {len(watch_links)} watch links')

        for link in watch_links[:20]:
            if not link.startswith('http'):
                link = f'{BASE}{link}'

            try:
                vid_match = re.search(r'vid=([a-f0-9]+)', link)
                if not vid_match:
                    continue
                vid = vid_match.group(1)

                title_resp = cffi.get(link, impersonate='chrome', timeout=15)
                title_soup = BeautifulSoup(title_resp.text, 'lxml')
                title_el = title_soup.select_one('h1, h2, .series-title, .entry-title')
                title = title_el.get_text(strip=True) if title_el else vid

                play_url = f'{BASE}/play.php?vid={vid}'
                play_resp = cffi.get(play_url, impersonate='chrome', timeout=15)
                play_soup = BeautifulSoup(play_resp.text, 'lxml')

                embed_urls = []
                for btn in play_soup.select('[data-embed-url]'):
                    embed_url = btn.get('data-embed-url', '')
                    if embed_url:
                        if not embed_url.startswith('http'):
                            embed_url = f'{BASE}{embed_url}'
                        embed_urls.append(embed_url)

                if not embed_urls:
                    embed_urls.append(f'{BASE}/embed.php?vid={vid}')

                tmdb_id = search_tmdb(title)

                for embed_url in embed_urls:
                    stream_url = extract_stream_from_embed(embed_url)
                    if stream_url:
                        q = '720p'
                        for srv in SERVERS:
                            if srv['pattern'] in embed_url:
                                q = srv['name']
                                break
                        print(f'    [{q}] {title}: {stream_url[:80]}...')
                        if '.m3u8' in stream_url:
                            saved = save_all_qualities(tmdb_id or vid, play_url, stream_url, category, title)
                            total += saved
                        else:
                            save_link(tmdb_id or vid, play_url, stream_url, category, title)
                            total += 1
                    else:
                        print(f'    [NO STREAM] {embed_url[:80]}...')
                time.sleep(0.5)

            except Exception as e:
                print(f'    Error: {e}')

    except Exception as e:
        print(f'[HD1] Fatal: {e}')

    log_result(BASE, category, total)
    print(f'[HD1] {name}: {total} streams')
    return total
