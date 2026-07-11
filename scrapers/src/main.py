import os
from pathlib import Path

from dotenv import load_dotenv

from sources import get_all_sites
from crawler import StreamCrawler
from notifier import send_telegram_alert

load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))

TEST_TMDB_IDS = ['550', '680', '13', '278', '238']


def main():
    sites = get_all_sites()
    print(f'Loading {len(sites)} sites...')

    crawler = StreamCrawler(category='all')

    all_urls = []
    for site in sites:
        base = site['url'].rstrip('/')
        for tmdb_id in TEST_TMDB_IDS:
            all_urls.append(f'{base}/search/{tmdb_id}')

    print(f'Queuing {len(all_urls)} URLs...')
    crawler.crawl(all_urls)
    print(f'Crawling complete. Logged {len(crawler.log)} pages.')

    send_telegram_alert(
        'Scraping Complete',
        'all',
        'N/A',
        'https://github.com/osoooama/osamap2/actions',
    )


if __name__ == '__main__':
    main()
