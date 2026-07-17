"""
FilGoal.com Sports Scraper
Scrapes live and upcoming matches from filgoal.com
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
matches_col = None
if DB_URI:
    try:
        client = pymongo.MongoClient(DB_URI, serverSelectionTimeoutMS=5000)
        db = client['OSAMAP2_DB']
        matches_col = db['matches']
    except Exception as e:
        print(f'[DB INIT WARN] {e}')

FILGOAL_MATCHES_URL = "https://www.filgoal.com/matches/ajaxlist"
FILGOAL_BASE = "https://www.filgoal.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.filgoal.com/",
    "X-Requested-With": "XMLHttpRequest",
}


def get_matches(date_str: str = None) -> list:
    if not date_str:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    params = {"date": date_str}
    try:
        resp = requests.get(FILGOAL_MATCHES_URL, params=params, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        ct = resp.headers.get("content-type", "")
        if "json" in ct:
            return resp.json() if isinstance(resp.json(), list) else resp.json().get("matches", resp.json().get("data", []))
        return []
    except Exception as e:
        print(f"[FilGoal] Error fetching matches: {e}")
        return []


def parse_matches(raw_data, date_str: str) -> list:
    matches = []
    if isinstance(raw_data, dict):
        raw_data = raw_data.get("matches", raw_data.get("data", []))
    if not isinstance(raw_data, list):
        return matches

    for item in raw_data:
        try:
            match_id = str(item.get("id", item.get("match_id", "")))
            if not match_id:
                continue

            home = item.get("home_team", item.get("homeTeam", item.get("home", "")))
            away = item.get("away_team", item.get("awayTeam", item.get("away", "")))
            league = item.get("league", item.get("competition", item.get("championship", "")))
            time_str = item.get("time", item.get("match_time", item.get("startTime", "")))
            status = item.get("status", item.get("match_status", "upcoming"))
            home_score = item.get("home_score", item.get("homeScore"))
            away_score = item.get("away_score", item.get("awayScore"))
            stream_url = item.get("direct_url", item.get("stream_url", ""))

            if status in ("live", "1", "in_progress"):
                match_status = "live"
            elif status in ("finished", "2", "ft", "ended"):
                match_status = "finished"
            else:
                match_status = "upcoming"

            matches.append({
                "match_id": match_id,
                "home_team": home,
                "away_team": away,
                "league": league,
                "match_time": time_str,
                "match_status": match_status,
                "home_score": int(home_score) if home_score else None,
                "away_score": int(away_score) if away_score else None,
                "stream_url": stream_url,
                "match_date": date_str,
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })
        except Exception as e:
            print(f"[FilGoal] Error parsing match: {e}")
            continue

    return matches


def save_matches(matches: list):
    if not matches_col:
        print("[FilGoal] No DB connection, skipping save")
        return 0
    saved = 0
    for match in matches:
        try:
            matches_col.update_one(
                {"match_id": match["match_id"]},
                {"$set": match},
                upsert=True,
            )
            saved += 1
        except Exception as e:
            print(f"[FilGoal] Error saving match: {e}")
    return saved


def crawl_filgoal():
    print("\n⚽ [FilGoal] Starting sports scraper...")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    raw = get_matches(today)
    matches = parse_matches(raw, today)
    saved = save_matches(matches)
    print(f"[FilGoal] Found {len(matches)} matches, saved {saved}")


if __name__ == "__main__":
    crawl_filgoal()
