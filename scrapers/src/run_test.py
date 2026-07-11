import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sources import get_all_sites
from sites.cineby import crawl as crawl_cineby
from sites.anime3rb import crawl as crawl_anime3rb
from sites.animeslayer import crawl as crawl_animeslayer

CRAWLER_MAP = {
    'cineby.cc': crawl_cineby,
    'www.streamex.net': crawl_cineby,
    'anime3rb.com': crawl_anime3rb,
    'animeslayer.to': crawl_animeslayer,
}

sites = get_all_sites()
ok = 0
fail = 0
total_streams = 0

for site in sites:
    name = site['name']
    crawler = CRAWLER_MAP.get(name)
    if not crawler:
        print(f'[SKIP] {name} - no crawler')
        fail += 1
        continue
    try:
        count = crawler(site)
        if count > 0:
            ok += 1
        else:
            fail += 1
        total_streams += count
    except Exception as e:
        print(f'[ERROR] {name}: {e}')
        fail += 1

print(f'\n=== RESULTS: {ok}/{len(sites)} OK, {total_streams} streams ===')
sys.exit(0 if ok > 0 else 1)
