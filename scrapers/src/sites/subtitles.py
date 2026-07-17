"""
Wyzie Subs Subtitle Scraper
Fetches subtitles for movies/TV shows from Wyzie Subs API (sub.wyzie.io)
Saves subtitle info to MongoDB so the frontend can display them.
"""
import os
import sys
import re
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from curl_cffi import requests as cffi
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent.parent.joinpath('.env'))

import pymongo

DB_URI = os.getenv('MONGODB_URI')
movies_col = None
if DB_URI:
    try:
        client = pymongo.MongoClient(DB_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000, socketTimeoutMS=5000)
        db = client['OSAMAP2_DB']
        movies_col = db['movies']
        client.admin.command('ping')
    except Exception as e:
        print(f'[Subs] DB not available: {e}')
        movies_col = None

WYZIE_API_KEY = os.getenv('WYZIE_API_KEY', '')
WYZIE_BASE = 'https://sub.wyzie.io/search'

PRIORITY_LANGS = ['ar', 'en', 'tr', 'fr', 'es', 'de', 'pt', 'ja', 'ko', 'zh']

LANG_NAMES = {
    'ar': 'Arabic', 'en': 'English', 'tr': 'Turkish', 'fr': 'French',
    'es': 'Spanish', 'de': 'German', 'pt': 'Portuguese', 'ja': 'Japanese',
    'ko': 'Korean', 'zh': 'Chinese', 'it': 'Italian', 'ru': 'Russian',
    'hi': 'Hindi', 'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian',
    'pl': 'Polish', 'nl': 'Dutch', 'sv': 'Swedish', 'da': 'Danish',
    'no': 'Norwegian', 'fi': 'Finnish', 'el': 'Greek', 'he': 'Hebrew',
    'cs': 'Czech', 'ro': 'Romanian', 'hu': 'Hungarian', 'uk': 'Ukrainian',
    'bg': 'Bulgarian', 'hr': 'Croatian', 'sk': 'Slovak', 'sl': 'Slovenian',
    'pb': 'Portuguese (BR)', 'sr': 'Serbian', 'ms': 'Malay', 'tl': 'Filipino',
}


def search_subtitles(tmdb_id, media_type='movie', season=None, episode=None, language=None):
    params = {'id': str(tmdb_id), 'key': WYZIE_API_KEY}
    if language:
        params['language'] = language
    if media_type == 'tv' and season and episode:
        params['season'] = str(season)
        params['episode'] = str(episode)

    try:
        resp = cffi.get(WYZIE_BASE, params=params, impersonate='chrome', timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                return data
            return []
        print(f'  [Subs] API {resp.status_code} for tmdb={tmdb_id}')
        return []
    except Exception as e:
        print(f'  [Subs] Error: {e}')
        return []


def pick_best_subtitle(subtitles):
    if not subtitles:
        return []
    scored = []
    for sub in subtitles:
        lang = sub.get('language', '')
        score = 0
        if lang in PRIORITY_LANGS:
            score = 100 - PRIORITY_LANGS.index(lang)
        fmt = sub.get('format', '')
        if fmt == 'srt':
            score += 5
        encoding = sub.get('encoding', '')
        if 'utf' in encoding.lower():
            score += 2
        scored.append((score, sub))
    scored.sort(key=lambda x: -x[0])
    seen_langs = set()
    result = []
    for score, sub in scored:
        lang = sub.get('language', '')
        if lang not in seen_langs and len(result) < 10:
            seen_langs.add(lang)
            result.append(sub)
    return result


def format_subtitles(subtitles):
    formatted = []
    for sub in subtitles:
        lang = sub.get('language', 'unknown')
        formatted.append({
            'lang': lang,
            'lang_name': LANG_NAMES.get(lang, lang.upper()),
            'url': sub.get('url', ''),
            'format': sub.get('format', 'srt'),
            'encoding': sub.get('encoding', 'utf-8'),
            'source': sub.get('source', ''),
            'flag_url': sub.get('flagUrl', ''),
        })
    return formatted


def crawl_subtitles():
    if not WYZIE_API_KEY:
        print('[Subs] No WYZIE_API_KEY, skipping')
        return

    if movies_col is None:
        print('[Subs] No DB connection, skipping')
        return

    print('\n[Subs] Starting subtitle scraper...')

    movies = list(movies_col.find({
        'subtitles': {'$size': 0},
        'tmdb_id': {'$ne': ''},
    }).limit(50))

    if not movies:
        movies = list(movies_col.find({
            'tmdb_id': {'$ne': ''},
        }).limit(50))

    print(f'[Subs] Processing {len(movies)} movies/shows')

    updated = 0
    for movie in movies:
        tmdb_id = movie.get('tmdb_id', '')
        media_type = movie.get('media_type', 'movie')
        title = movie.get('title', 'Unknown')

        if not tmdb_id:
            continue

        print(f'  [{tmdb_id}] {title} ({media_type})')

        if media_type == 'tv':
            subs = search_subtitles(tmdb_id, 'tv', season=1, episode=1)
        else:
            subs = search_subtitles(tmdb_id, 'movie')

        best = pick_best_subtitle(subs)
        formatted = format_subtitles(best)

        if formatted:
            try:
                movies_col.update_one(
                    {'tmdb_id': tmdb_id},
                    {'$set': {
                        'subtitles': formatted,
                        'subtitles_updated': datetime.now(timezone.utc).isoformat(),
                    }}
                )
                updated += 1
                langs = ', '.join(s['lang_name'] for s in formatted[:5])
                print(f'    Found {len(formatted)} subs: {langs}')
            except Exception as e:
                print(f'    [DB Error] {e}')
        else:
            print(f'    No subtitles found')

    print(f'[Subs] Done. Updated {updated}/{len(movies)} movies with subtitles')


if __name__ == '__main__':
    crawl_subtitles()
