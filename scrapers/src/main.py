import os
import asyncio
from pathlib import Path

from dotenv import load_dotenv

from sources import get_all_sites
from crawler import StreamCrawler
from notifier import send_telegram_alert

load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))

TEST_TMDB_IDS = ['550', '680', '13', '278', '238']


async def main():
    sites = get_all_sites()
    print(f'Loading {len(sites)} sites...')

    crawler = StreamCrawler(category='all', concurrency=5)

    all_urls = []
    for site in sites:
        base = site['url'].rstrip('/')
        for tmdb_id in TEST_TMDB_IDS:
            all_urls.append(f'{base}/search/{tmdb_id}')

    print(f'Queuing {len(all_urls)} URLs...')
    await crawler.run(all_urls)
    print(f'Crawling complete. Logged {len(crawler.log)} pages.')

    send_telegram_alert(
        'Scraping Complete',
        'all',
        'N/A',
        'https://github.com/osoooama/osamap2/actions',
    )


if __name__ == '__main__':
    asyncio.run(main())
