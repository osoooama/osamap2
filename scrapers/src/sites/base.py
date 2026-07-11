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

client = pymongo.MongoClient(os.getenv('MONGODB_URI'))
db = client['OSAMAP2_DB']
links_col = db['links']
logs_col = db['crawl_logs']

AD_DOMAINS = [
    'doubleclick', 'googlesyndication', 'adservice', 'popunder',
    'exoclick', 'propellerads', 'linkvertise', 'ouo.io', 'dtscout',
    'sharethis', 'histats', 'push-sdk', 'adsboosters', 'adserver',
    'adfoc', 'adbucks', 'admedia', 'adtrue', 'adreactor',
]

STREAM_DOMAINS = [
    'play.xpass.top', 'player.videasy', 'wingsdatabase', 'vid3rb.com',
    'video.vid3rb', 'sau.trovianaworks', 'm3u8', '.m3u8',
]

CATEGORY_PLATFORM = {
    'foreign': 'netflix',
    'arabic': 'shahid',
    'turkish': 'shahid',
    'anime': 'crunchyroll',
    'animation': 'disney',
}


def is_ad_url(url):
    if not url:
        return True
    parsed = urlparse(url.lower())
    domain = parsed.netloc or parsed.path
    if any(ad in domain for ad in AD_DOMAINS):
        return True
    if any(sd in url.lower() for sd in STREAM_DOMAINS):
        return False
    return False


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
    if '1080' in url or '1080p' in url:
        return '1080p'
    if '720' in url or '720p' in url:
        return '720p'
    if '4k' in url.lower() or '2160' in url:
        return '4K'
    if '480' in url or '480p' in url:
        return '480p'
    return '720p'


def save_link(tmdb_id, source_url, stream_url, category, title=''):
    if is_ad_url(stream_url):
        print(f'    [AD SKIPPED] {stream_url[:80]}...')
        return False
    quality = detect_quality(stream_url)

    result = links_col.update_one(
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

    from notifier import send_telegram_alert
    try:
        send_telegram_alert(title, category, quality, stream_url)
    except:
        pass

    return True


def save_all_qualities(tmdb_id, source_url, stream_url, category, title=''):
    if not stream_url or '.m3u8' not in stream_url:
        return save_link(tmdb_id, source_url, stream_url, category, title)

    variants = parse_m3u8_playlists(stream_url)
    saved = 0
    for v in variants:
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
            from notifier import send_telegram_alert
            try:
                send_telegram_alert(title, category, v['quality'], v['url'])
            except:
                pass
            saved += 1
        except:
            pass
    return saved


def log_result(url, category, streams_found, error=None):
    logs_col.insert_one({
        'url': url, 'category': category,
        'streams_found': streams_found,
        'error': error or '',
        'timestamp': datetime.now(timezone.utc),
    })


def extract_tmdb_id(url):
    match = re.search(r'/movie/(\d+)|/tv/(\d+)|tmdb_id=(\d+)', url)
    if match:
        return next(g for g in match.groups() if g)
    return None
