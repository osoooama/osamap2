"""
IPTV Channel Scraper — Free channels from Novatv (url.json)
No Xtream credentials needed — fetches free Arabic IPTV streams
"""
import os
import sys
import requests
import json
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

# Free IPTV source from Novatv
FREE_IPTV_URL = "https://abdotv.online/abdotvapp/url.json"

# Channel ID to name mapping (from Novatv smali)
CHANNEL_NAMES = {
    0: "beIN Sports 1",
    1: "beIN Sports 2",
    2: "beIN Sports 3",
    3: "beIN Sports 4",
    4: "beIN Sports 5",
    5: "beIN Sports 6",
    10: "beIN Sports News",
    17: "beIN Sports Max 1",
    18: "beIN Sports Max 2",
    19: "beIN Sports Max 3",
    20: "Alkass One HD",
    21: "Al Jazeera Sports",
    22: "Abu Dhabi Sports 1",
    23: "Shahid Sports 1",
    24: "Shahid Sports 2",
    25: "Shahid Sports 4",
    26: "Shahid Sports 5",
    27: "Shahid Sports 6",
    28: "Alkass 1",
    29: "Alkass 2",
    30: "Alkass 3",
    31: "Alkass 4",
    32: "Alkass 5",
    33: "Kuwait TV Sports",
    34: "Kuwait TV Sports 2",
    35: "Kuwait TV Sports 3",
    36: "Kuwait TV Sports 4",
    37: "Kuwait TV Sports 5",
    38: "Dubai Sports 1",
    39: "Dubai Sports 2",
    41: "Dubai Racing",
    42: "Arryadia (Morocco)",
    43: "Oman Sport",
    44: "MBC Action",
    45: "MBC Drama",
    46: "SSC 1",
    47: "SSC 2",
    48: "SSC 3",
    116: "Rotana Cinema",
    117: "Rotana Cinema Egypt",
    118: "Rotana Classic",
    119: "Rotana Aflam Plus",
    120: "Rotana Comedy",
    121: "Rotana Drama",
    122: "Rotana Kids",
}

# Category mapping
CATEGORY_MAP = {
    0: "Sports", 1: "Sports", 2: "Sports", 3: "Sports", 4: "Sports", 5: "Sports",
    10: "Sports", 17: "Sports", 18: "Sports", 19: "Sports",
    20: "Sports", 21: "Sports", 22: "Sports",
    23: "Sports", 24: "Sports", 25: "Sports", 26: "Sports", 27: "Sports",
    28: "Sports", 29: "Sports", 30: "Sports", 31: "Sports", 32: "Sports",
    33: "Sports", 34: "Sports", 35: "Sports", 36: "Sports", 37: "Sports",
    38: "Sports", 39: "Sports", 41: "Sports",
    42: "Sports", 43: "Sports",
    44: "Entertainment", 45: "Entertainment",
    46: "Sports", 47: "Sports", 48: "Sports",
    116: "Movies", 117: "Movies", 118: "Movies", 119: "Movies",
    120: "Entertainment", 121: "Entertainment", 122: "Kids",
}


def fetch_free_channels() -> list:
    """Fetch free IPTV channels from Novatv url.json."""
    try:
        resp = requests.get(FREE_IPTV_URL, timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        resp.raise_for_status()
        data = resp.json()
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[IPTV] Error fetching free channels: {e}")
        return []


def parse_channels(raw_data: list) -> list:
    """Parse raw channel data into structured objects."""
    channels = []
    for item in raw_data:
        try:
            channel_id = item.get("channel_id")
            if channel_id is None:
                continue
            channel_id = int(channel_id)
            servers = item.get("servers", [])
            if not servers:
                continue

            # Use first non-hidden server
            server = None
            for s in servers:
                if not s.get("hidden", False):
                    server = s
                    break
            if not server:
                server = servers[0]

            stream_url = server.get("url", "")
            if not stream_url:
                continue

            name = CHANNEL_NAMES.get(channel_id, f"Channel {channel_id}")
            category = CATEGORY_MAP.get(channel_id, "General")

            channels.append({
                "channel_id": f"novatv_{channel_id}",
                "name": name,
                "stream_url": stream_url,
                "category": category,
                "logo_url": "",
                "stream_type": "live",
                "is_active": True,
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })
        except Exception as e:
            print(f"[IPTV] Error parsing channel: {e}")
            continue

    return channels


def save_channels(channels: list):
    """Save channels to MongoDB."""
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
    """Main entry point — no credentials needed."""
    print("\n📺 [IPTV] Starting free IPTV channel scraper...")

    raw = fetch_free_channels()
    channels = parse_channels(raw)
    saved = save_channels(channels)

    print(f"[IPTV] Found {len(channels)} channels, saved {saved}")
    print(f"[IPTV] Categories: Sports, Movies, Entertainment, Kids")


if __name__ == "__main__":
    crawl_iptv()
