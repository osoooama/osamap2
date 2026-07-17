"""
IPTV Channel Scraper — Xtream Codes API
Fetches live TV channels from Xtream-compatible IPTV servers
"""
import os
import sys
import requests
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent.parent.joinpath('.env'))

import pymongo

DB_URI = os.getenv('MONGODB_URI')
channels_col = None
if DB_URI:
    try:
        client = pymongo.MongoClient(DB_URI, serverSelectionTimeoutMS=5000)
        db = client['OSAMAP2_DB']
        channels_col = db['channels']
    except Exception as e:
        print(f'[DB INIT WARN] {e}')

# Xtream Codes server credentials from env
XTREAM_URL = os.getenv('XTREAM_URL', '')
XTREAM_USER = os.getenv('XTREAM_USER', '')
XTREAM_PASS = os.getenv('XTREAM_PASS', '')


def build_api_url(action: str) -> str:
    if not XTREAM_URL or not XTREAM_USER or not XTREAM_PASS:
        return ''
    base = XTREAM_URL.rstrip('/')
    if '/player_api.php' not in base:
        base = f"{base}/player_api.php"
    return f"{base}?username={XTREAM_USER}&password={XTREAM_PASS}&action={action}"


def build_stream_url(stream_id: str, stream_type: str = 'live') -> str:
    if not XTREAM_URL or not XTREAM_USER or not XTREAM_PASS:
        return ''
    base = XTREAM_URL.rstrip('/')
    if '/player_api.php' in base:
        base = base.split('/player_api.php')[0]
    if stream_type == 'live':
        return f"{base}/live/{XTREAM_USER}/{XTREAM_PASS}/{stream_id}.m3u8"
    elif stream_type == 'movie':
        return f"{base}/movie/{XTREAM_USER}/{XTREAM_PASS}/{stream_id}"
    elif stream_type == 'series':
        return f"{base}/series/{XTREAM_USER}/{XTREAM_PASS}/{stream_id}"
    return ''


def fetch_json(url: str) -> any:
    if not url:
        return None
    try:
        resp = requests.get(url, timeout=15, headers={
            "User-Agent": "OSK+ IPTV/1.0"
        })
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[IPTV] Error fetching {url}: {e}")
        return None


def fetch_live_categories() -> list:
    url = build_api_url('get_live_categories')
    data = fetch_json(url)
    return data if isinstance(data, list) else []


def fetch_live_streams(category_id: str = None) -> list:
    url = build_api_url('get_live_streams')
    if category_id:
        url += f"&category_id={category_id}"
    data = fetch_json(url)
    return data if isinstance(data, list) else []


def fetch_vod_categories() -> list:
    url = build_api_url('get_vod_categories')
    data = fetch_json(url)
    return data if isinstance(data, list) else []


def fetch_vod_streams(category_id: str = None) -> list:
    url = build_api_url('get_vod_streams')
    if category_id:
        url += f"&category_id={category_id}"
    data = fetch_json(url)
    return data if isinstance(data, list) else []


def fetch_series_categories() -> list:
    url = build_api_url('get_series_categories')
    data = fetch_json(url)
    return data if isinstance(data, list) else []


def fetch_series(category_id: str = None) -> list:
    url = build_api_url('get_series')
    if category_id:
        url += f"&category_id={category_id}"
    data = fetch_json(url)
    return data if isinstance(data, list) else []


def save_channels(channels: list):
    if not channels_col:
        print("[IPTV] No DB connection, skipping save")
        return 0
    saved = 0
    for ch in channels:
        try:
            channels_col.update_one(
                {"channel_id": ch["channel_id"]},
                {"$set": ch},
                upsert=True,
            )
            saved += 1
        except Exception as e:
            print(f"[IPTV] Error saving channel: {e}")
    return saved


def crawl_iptv():
    print("\n📺 [IPTV] Starting IPTV channel scraper...")

    if not XTREAM_URL or not XTREAM_USER or not XTREAM_PASS:
        print("[IPTV] No Xtream credentials in .env — skipping")
        print("[IPTV] Set XTREAM_URL, XTREAM_USER, XTREAM_PASS in scrapers/.env")
        return

    all_channels = []

    # Live channels
    print("[IPTV] Fetching live categories...")
    live_cats = fetch_live_categories()
    print(f"[IPTV] Found {len(live_cats)} live categories")

    for cat in live_cats[:20]:
        cat_id = str(cat.get("category_id", ""))
        cat_name = cat.get("category_name", "General")
        streams = fetch_live_streams(cat_id)
        for s in streams:
            sid = str(s.get("stream_id", ""))
            if not sid:
                continue
            all_channels.append({
                "channel_id": f"live_{sid}",
                "name": s.get("name", s.get("num", "")),
                "stream_url": build_stream_url(sid, 'live'),
                "category": cat_name,
                "logo_url": s.get("stream_icon", ""),
                "stream_type": "live",
                "is_active": True,
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })

    # VOD channels
    print("[IPTV] Fetching VOD categories...")
    vod_cats = fetch_vod_categories()
    print(f"[IPTV] Found {len(vod_cats)} VOD categories")

    for cat in vod_cats[:20]:
        cat_id = str(cat.get("category_id", ""))
        cat_name = cat.get("category_name", "Movies")
        streams = fetch_vod_streams(cat_id)
        for s in streams:
            sid = str(s.get("stream_id", ""))
            if not sid:
                continue
            ext = s.get("container_extension", "mp4")
            all_channels.append({
                "channel_id": f"vod_{sid}",
                "name": s.get("name", ""),
                "stream_url": build_stream_url(sid, 'movie'),
                "category": cat_name,
                "logo_url": s.get("stream_icon", ""),
                "stream_type": "movie",
                "is_active": True,
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })

    saved = save_channels(all_channels)
    print(f"[IPTV] Total channels: {len(all_channels)}, saved: {saved}")


if __name__ == "__main__":
    crawl_iptv()
