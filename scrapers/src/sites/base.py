import os
import sys
import re
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
