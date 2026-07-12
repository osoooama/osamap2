import sys, os, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / 'src'))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / '.env')

# Monkey-patch log_result and save_link to skip DB if it fails
from sites import base
original_log = base.log_result

def safe_log(url, category, streams_found, error=None):
    try:
        original_log(url, category, streams_found, error)
    except Exception as e:
        print(f'  [DB LOG SKIP] {e}')

base.log_result = safe_log

# Also monkey-patch save_link/save_all_qualities
original_save = base.save_link
def safe_save(tmdb_id, source_url, stream_url, category, title=''):
    try:
        return original_save(tmdb_id, source_url, stream_url, category, title)
    except Exception as e:
        print(f'  [DB SAVE SKIP] {str(e)[:60]}...')
        return False
base.save_link = safe_save

original_save_all = base.save_all_qualities
def safe_save_all(tmdb_id, source_url, stream_url, category, title=''):
    try:
        return original_save_all(tmdb_id, source_url, stream_url, category, title)
    except Exception as e:
        print(f'  [DB SAVE ALL SKIP] {str(e)[:60]}...')
        return 0
base.save_all_qualities = safe_save_all

from sources import get_all_sites
from sites.cineby import crawl as crawl_cineby
from sites.anime3rb_v2 import crawl as crawl_anime3rb
from sites.animeslayer import crawl as crawl_animeslayer
from sites.cinemana import crawl as crawl_cinemana
from sites.hd1brstej import crawl as crawl_hd1brstej
from sites.arabic_sites import crawl as crawl_arabic

CRAWLER_MAP = {
    'streamex.sh': crawl_cineby,
    'anime3rb.com': crawl_anime3rb,
    'animeslayer.to': crawl_animeslayer,
    'cinemana.cc': crawl_cinemana,
    'hd1.brstej.com': crawl_hd1brstej,
    'mycima.video': crawl_arabic,
    'eegebest.com': crawl_arabic,
    'fajer.show': crawl_arabic,
    '3iskk.xyz': crawl_arabic,
    '7obtv.co': crawl_arabic,
    'dizipal2085.com': crawl_arabic,
}

sites = get_all_sites()
print(f'Running {len(sites)} site crawlers...')

total = 0
for site in sites:
    name = site['name']
    crawler_fn = CRAWLER_MAP.get(name)
    if not crawler_fn:
        print(f'[SKIP] No crawler for {name}')
        continue
    print(f'\n{"="*60}')
    print(f'[START] {name}')
    print(f'{"="*60}')
    try:
        count = crawler_fn(site)
        total += count
    except Exception as e:
        print(f'[ERROR] {name}: {e}')
        import traceback
        traceback.print_exc()

print(f'\n{"="*60}')
print(f'All crawlers complete. Total streams: {total}')
print(f'{"="*60}')
