import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sources import get_all_sites
from sites.cineby import crawl as crawl_cineby
from sites.hd1brstej import crawl as crawl_hd1brstej
from sites.animeslayer import crawl as crawl_animeslayer
from sites.faselhd import crawl as crawl_faselhd
from sites.qissat import crawl as crawl_qissat
from sites.dizipal import crawl as crawl_dizipal
from sites.turkish_sites import crawl as crawl_turkish_sites
from sites.filgoal import crawl_filgoal
from sites.iptv import crawl_iptv
from sites.subtitles import crawl_subtitles
from sites.movies123 import crawl as crawl_movies123

CRAWLER_MAP = {
    'streamex.sh': crawl_cineby,
    'hd1.brstej.com': crawl_hd1brstej,
    'animeslayer.to': crawl_animeslayer,
    'faselhd.club': crawl_faselhd,
    'ar.qissat.tv': crawl_qissat,
    'dizipal104.vip': crawl_dizipal,
    'hdfilmcehennemi.sh': crawl_turkish_sites,
    '123moviesfree.net': crawl_movies123,
}

EXTRA_SCRAPERS = [crawl_filgoal, crawl_iptv, crawl_subtitles]


def run():
    sites = get_all_sites()
    print(f'Running {len(sites)} site crawlers + {len(EXTRA_SCRAPERS)} extra scrapers...')

    total = 0
    for site in sites:
        name = site['name']
        crawler_fn = CRAWLER_MAP.get(name)
        if not crawler_fn:
            print(f'[SKIP] No crawler for {name}')
            continue
        try:
            count = crawler_fn(site)
            total += count
        except Exception as e:
            print(f'[ERROR] {name}: {e}')
            import traceback
            traceback.print_exc()

    for extra_fn in EXTRA_SCRAPERS:
        try:
            extra_fn()
        except Exception as e:
            print(f'[ERROR] {extra_fn.__name__}: {e}')
            import traceback
            traceback.print_exc()

    print(f'\n=== All crawlers complete. Total streams: {total} ===')
    return total


if __name__ == '__main__':
    run()
