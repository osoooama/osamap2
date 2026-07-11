import os
import asyncio
from datetime import datetime, timezone

import pymongo
from dotenv import load_dotenv

from sources import SOURCES
from crawler import StreamingCrawler
from ai_classifier import batch_classify
from notifier import send_telegram_alert

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
client = pymongo.MongoClient(os.getenv('MONGODB_URI'))
db = client['OSAMAP2_DB']
movies_col = db['movies']
links_col = db['links']

TEST_TMDB_IDS = [
    '550', '680', '238', '157336', '244786',
    '155', '497', '27205', '15512', '1124',
]


async def process_category(category, sites):
    print(f'[{category}] Starting crawl of {len(sites)} sites...')
    crawler = StreamingCrawler(sites, category, TEST_TMDB_IDS)
    results = await crawler.run()
    if not results:
        print(f'[{category}] No results found')
        return
    classified = batch_classify(results)
    for item in classified:
        now = datetime.now(timezone.utc)
        for stream in item.get('streams', []):
            cls = item.get('classification', {})
            links_col.update_one(
                {'stream_url': stream, 'category': category},
                {'$set': {
                    'stream_url': stream,
                    'source_url': item['url'],
                    'category': category,
                    'quality': cls.get('quality', 'unknown'),
                    'stream_type': cls.get('type', 'vod'),
                    'language': cls.get('language', 'unknown'),
                    'is_active': True,
                    'last_checked': now,
                }},
                upsert=True,
            )
            q = cls.get('quality', 'unknown')
            send_telegram_alert(f'Stream from {item["url"]}', category, q, stream)
        print(f'[{category}] Saved {len(item.get("streams", []))} streams')


async def main():
    print('Starting OSAMA/>Dev scraper...')
    tasks = [process_category(cat, sites) for cat, sites in SOURCES.items()]
    await asyncio.gather(*tasks)
    print('Scraping complete.')


if __name__ == '__main__':
    asyncio.run(main())
