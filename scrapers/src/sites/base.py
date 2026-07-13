import os
import sys
import re
import requests
from datetime import datetime, timezone
from urllib.parse import urlparse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pymongo
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.parent.joinpath('.env'))

DB_URI = os.getenv('MONGODB_URI')
links_col = logs_col = None
if DB_URI:
    try:
        client = pymongo.MongoClient(DB_URI, serverSelectionTimeoutMS=5000)
        db = client['OSAMAP2_DB']
        links_col = db['links']
        logs_col = db['crawl_logs']
    except Exception as e:
        print(f'[DB INIT WARN] {e}')

CATEGORY_PLATFORM = {
    'foreign': 'netflix',
    'arabic': 'shahid',
    'turkish': 'shahid',
    'anime': 'crunchyroll',
    'animation': 'disney',
}

REQUIRED_EXTENSIONS = (
    '.m3u8', '.mpd', '.mp4', '.webm', '.ts', '.mkv', '.mov',
    '.avi', '.flv', '.f4m', '.ism', '.isml', '.m3u',
)

AD_DOMAINS = ('doubleclick', 'googlesyndication', 'adservice', 'popunder',
    'exoclick', 'propellerads', 'linkvertise', 'ouo.io', 'dtscout',
    'sharethis', 'histats', 'push-sdk', 'adsboosters', 'adserver',
    'adfoc', 'adbucks', 'admedia', 'adtrue', 'adreactor', 'googlead',
    'demdex', 'addtoany', 'resultsfastfind', 'clickserve',
    'taboola', 'outbrain', 'revcontent', 'mgid', 'criteo',
    'scorecardresearch', 'quantserve', 'comscore', 'moatads',
    'teads', 'pubmatic', 'appnexus', 'amazon-adsystem',
    'media.net', 'adcash', 'adform', 'adition', 'unpkg')

BLOCKED_PATH_PATTERNS = (
    '/sr/', '/pixel', '/analytics', '/beacon', '/impression',
    '/click', '/redirect', '/count', '/visit', '/track',
    '/event', '/collect', '/sync', '/match', '/conversion',
    '/ad/', '/campaign', '/banner', '/popup', '/popunder',
)

STREAM_PROTOCOLS = ('http://', 'https://', 'rtmp://', 'rtmps://',
    'rtsp://', 'rtsps://', 'rtp://', 'udp://', 'srt://',
    'rist://', 'mms://')


def has_required_extension(url):
    if not url:
        return False
    lower = url.lower().strip()
    parsed = urlparse(lower)
    path = parsed.path
    return any(path.endswith(ext) for ext in REQUIRED_EXTENSIONS)


def is_media_url(url):
    if not url:
        return False
    lower = url.lower().strip()
    parsed = urlparse(lower)
    domain = parsed.netloc
    path = parsed.path

    if not domain or not any(lower.startswith(p) for p in STREAM_PROTOCOLS):
        return False

    if any(ad in domain for ad in AD_DOMAINS):
        return False

    if not any(path.endswith(ext) for ext in REQUIRED_EXTENSIONS):
        return False

    if any(pat in path for pat in BLOCKED_PATH_PATTERNS):
        return False

    return True


def parse_m3u8_playlists(master_url):
    variants = []
    try:
        resp = requests.get(master_url, timeout=20, headers={'User-Agent': 'Mozilla/5.0'})
        if not resp.ok:
            return [{'url': master_url, 'quality': '720p'}]
        text = resp.text
        lines = text.split('\n')

        base = master_url.rsplit('/', 1)[0] if '/' in master_url else ''

        current_res = '720p'
        for i, line in enumerate(lines):
            if '#EXT-X-STREAM-INF' in line:
                res_match = re.search(r'RESOLUTION=\d+x(\d+)', line)
                if res_match:
                    h = int(res_match.group(1))
                    if h >= 2160: current_res = '4K'
                    elif h >= 1080: current_res = '1080p'
                    elif h >= 720: current_res = '720p'
                    elif h >= 480: current_res = '480p'
                    else: current_res = '360p'
                bw_match = re.search(r'BANDWIDTH=(\d+)', line)
                if bw_match:
                    bw = int(bw_match.group(1))
                    if bw >= 15000000: current_res = '4K'
                    elif bw >= 5000000: current_res = '1080p'
                    elif bw >= 2000000: current_res = '720p'
                    elif bw >= 800000: current_res = '480p'
                    else: current_res = '360p'
                next_i = i + 1
                while next_i < len(lines) and lines[next_i].strip() == '':
                    next_i += 1
                if next_i < len(lines):
                    url_line = lines[next_i].strip()
                    if not url_line.startswith('http'):
                        url_line = f'{base}/{url_line}' if base else url_line
                    variants.append({'url': url_line, 'quality': current_res})
            elif line.startswith('#EXT-X-MEDIA'):
                pass
        if not variants:
            return [{'url': master_url, 'quality': '720p'}]
        return variants
    except:
        return [{'url': master_url, 'quality': '720p'}]


def detect_quality(url):
    if '4k' in url.lower() or '2160' in url:
        return '4K'
    if '2k' in url.lower():
        return '2K'
    if '1080' in url:
        return '1080p'
    if '720' in url:
        return '720p'
    if '480' in url:
        return '480p'
    if '360' in url:
        return '360p'
    return '720p'


def verify_stream_url(url):
    try:
        resp = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0',
            'Referer': 'https://play.xpass.top/', 'Origin': 'https://play.xpass.top'}, stream=True)
        if resp.ok:
            return True
        if resp.status_code in (401, 403):
            body = resp.text[:200].lower()
            if '404' in body or 'not found' in body or 'expired' in body or 'error' in body:
                return False
            return True
        return False
    except Exception:
        return False

def save_link(tmdb_id, source_url, stream_url, category, title=''):
    if not is_media_url(stream_url):
        print(f'    [NOT A STREAM] {stream_url[:100]}...')
        return False
    if not verify_stream_url(stream_url):
        print(f'    [DEAD STREAM] {stream_url[:100]}...')
        return False
    quality = detect_quality(stream_url)

    if links_col is not None:
        try:
            links_col.update_one(
                {'embed_url': stream_url},
                {'$set': {
                    'embed_url': stream_url,
                    'source': source_url,
                    'category': category,
                    'platform': CATEGORY_PLATFORM.get(category, category),
                    'title': title,
                    'quality': quality,
                    'tmdb_id': str(tmdb_id) if tmdb_id else '',
                    'is_active': True,
                    'last_checked': datetime.now(timezone.utc),
                }},
                upsert=True,
            )
        except Exception as e:
            print(f'    [DB SAVE ERROR] {e}')

    from notifier import send_telegram_alert
    try:
        send_telegram_alert(title, category, quality, stream_url)
    except:
        pass

    return True


def save_all_qualities(tmdb_id, source_url, stream_url, category, title=''):
    if not is_media_url(stream_url):
        print(f'    [NOT A STREAM] {stream_url[:100]}...')
        return False

    if '.m3u8' not in stream_url:
        return save_link(tmdb_id, source_url, stream_url, category, title)

    variants = parse_m3u8_playlists(stream_url)
    saved = 0
    for v in variants:
        if not is_media_url(v['url']):
            continue
        if links_col is not None:
            try:
                links_col.update_one(
                    {'embed_url': v['url']},
                    {'$set': {
                        'embed_url': v['url'],
                        'source': source_url,
                        'category': category,
                        'platform': CATEGORY_PLATFORM.get(category, category),
                        'title': title,
                        'quality': v['quality'],
                        'tmdb_id': str(tmdb_id) if tmdb_id else '',
                        'is_active': True,
                        'last_checked': datetime.now(timezone.utc),
                    }},
                    upsert=True,
                )
            except Exception as e:
                print(f'    [DB SAVE ERROR] {e}')
        from notifier import send_telegram_alert
        try:
            send_telegram_alert(title, category, v['quality'], v['url'])
        except:
            pass
        saved += 1
    return saved


def log_result(url, category, streams_found, error=None):
    if logs_col is None:
        return
    try:
        logs_col.insert_one({
            'url': url, 'category': category,
            'streams_found': streams_found,
            'error': error or '',
            'timestamp': datetime.now(timezone.utc),
        })
    except Exception as e:
        print(f'    [DB LOG ERROR] {e}')


def extract_tmdb_id(url):
    match = re.search(r'/movie/(\d+)|/tv/(\d+)|tmdb_id=(\d+)', url)
    if match:
        return next(g for g in match.groups() if g)
    return None
