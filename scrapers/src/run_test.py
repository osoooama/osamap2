import os
import sys
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))

from crawler import fetch_page_requests, extract_stream_urls, is_ad_url
from bs4 import BeautifulSoup

TEST_URLS = [
    ('cineby.cc', 'https://cineby.cc/search/550'),
    ('faselplus.cc', 'https://faselplus.cc/search/550'),
    ('kayifamily.com', 'https://kayifamily.com/search/550'),
    ('hianime.to', 'https://hianime.to/search/550'),
    ('akwam.cc', 'https://akwam.cc/search/550'),
    ('mycima.tube', 'https://mycima.tube/search/550'),
    ('3iskk.xyz', 'https://3iskk.xyz/search/550'),
    ('dizipal.com', 'https://dizipal.com/search/550'),
    ('animekaizoku.com', 'https://animekaizoku.com/search/550'),
    ('shahiid-anime.net', 'https://shahiid-anime.net/search/550'),
]

ok = 0
fail = 0
found = 0

for name, url in TEST_URLS:
    print(f'[{name}] {url}')
    html = fetch_page_requests(url, timeout=20)
    if html:
        soup = BeautifulSoup(html, 'lxml')
        streams = extract_stream_urls(soup)
        print(f'  [OK] {len(html)} bytes, {len(streams)} streams')
        if streams:
            found += 1
            for s in streams[:2]:
                print(f'  >>> {s}')
        ok += 1
    else:
        print(f'  [FAIL]')
        fail += 1

print(f'\n=== RESULTS: {ok}/{len(TEST_URLS)} OK, {found} with streams ===')
sys.exit(0 if ok > 0 else 1)
