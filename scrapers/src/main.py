import asyncio
import os
import random
from datetime import datetime, timezone

import pymongo
from dotenv import load_dotenv

from sources import SOURCES
from utils.base_scraper import BaseScraper
from utils.notifier import send_telegram_alert

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
client = pymongo.MongoClient(os.getenv('MONGODB_URI'))
db = client['OSAMAP2_DB']
movies_col = db['movies']
links_col = db['links']

TEST_TMDB_IDS = [
    '550', '680', '238', '157336', '244786',
    '155', '497', '27205', '15512', '1124',
]

MAX_CONCURRENT = 5
semaphore = asyncio.Semaphore(MAX_CONCURRENT)


async def scrape_site(tmdb_id, site_data, category):
    site_name = site_data['name']
    search_url = f"{site_data['url']}/search/{tmdb_id}"

    async with semaphore:
        scraper = BaseScraper()
        try:
            html = await scraper.get_page(search_url, use_js=True)
            if not html:
                html = await scraper.get_page(search_url)

            if not html:
                print(f'[{site_name}] No response for TMDB {tmdb_id}')
                return

            embed_url = scraper.extract_iframe(html)
            if not embed_url:
                video_url = scraper.extract_video(html)
                if video_url:
                    embed_url = video_url

            if embed_url:
                now = datetime.now(timezone.utc)
                movie = movies_col.find_one({'tmdb_id': tmdb_id})
                if not movie:
                    movie_id = movies_col.insert_one({
                        'tmdb_id': tmdb_id,
                        'title': f'Movie {tmdb_id}',
                        'category': category,
                        'created_at': now,
                    }).inserted_id
                else:
                    movie_id = movie['_id']

                links_col.update_one(
                    {'tmdb_id': tmdb_id, 'source': site_name},
                    {'$set': {
                        'embed_url': embed_url,
                        'source': site_name,
                        'quality': '1080p',
                        'is_active': True,
                        'last_checked': now,
                    }},
                    upsert=True,
                )

                send_telegram_alert(f'{site_name} - TMDB {tmdb_id}', category, '1080p', embed_url)
                print(f'[{site_name}] Found embed for TMDB {tmdb_id}')
            else:
                links_col.update_many(
                    {'tmdb_id': tmdb_id, 'source': site_name},
                    {'$set': {'is_active': False}}
                )
                print(f'[{site_name}] No embed found for TMDB {tmdb_id}')

            await asyncio.sleep(random.uniform(3, 7))

        except Exception as e:
            print(f'[{site_name}] Error: {e}')
            links_col.update_many(
                {'tmdb_id': tmdb_id, 'source': site_name},
                {'$set': {'is_active': False}}
            )


async def main():
    print('Starting scraper...')
    tasks = []

    for category, sites in SOURCES.items():
        for tmdb_id in TEST_TMDB_IDS:
            for site in sites:
                tasks.append(scrape_site(tmdb_id, site, category))

    await asyncio.gather(*tasks)
    print('Scraping complete.')


if __name__ == '__main__':
    asyncio.run(main())
