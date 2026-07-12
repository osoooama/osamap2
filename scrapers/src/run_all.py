import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sources import get_all_sites
from sites.cineby import crawl as crawl_cineby
from sites.anime3rb import crawl as crawl_anime3rb_old
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


def run():
    sites = get_all_sites()
    print(f'Running {len(sites)} site crawlers...')

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

    print(f'\n=== All crawlers complete. Total streams: {total} ===')
    return total


if __name__ == '__main__':
    run()
