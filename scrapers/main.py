import asyncio
import os
from datetime import datetime
import pymongo
from dotenv import load_dotenv
from utils.base_scraper import BaseScraper
from utils.notifier import send_telegram_alert
from sources import SOURCES

load_dotenv()
client = pymongo.MongoClient(os.getenv('MONGODB_URI'))
db = client['OSAMAP2_DB']
movies_col = db['movies']
links_col = db['links']


async def scrape_all():
    scraper = BaseScraper()
    for category, sites in SOURCES.items():
        for site in sites:
            try:
                url = f'https://{site}/latest'
                html = await scraper.get_page(url)
                if html:
                    embed = scraper.extract_iframe(html)
                    if embed:
                        tmdb_id = scraper.extract_tmdb_id(embed)
                        if tmdb_id:
                            movie = movies_col.find_one({'tmdb_id': tmdb_id})
                            if not movie:
                                movie_id = movies_col.insert_one({
                                    'tmdb_id': tmdb_id,
                                    'category': category,
                                    'created_at': datetime.utcnow(),
                                }).inserted_id
                                links_col.insert_one({
                                    'movie_id': movie_id,
                                    'source_site': site,
                                    'embed_url': embed,
                                    'quality': '1080p',
                                    'is_active': True,
                                    'updated_at': datetime.utcnow(),
                                })
                                send_telegram_alert(
                                    f'New from {site}', category, '1080p', embed
                                )
                            else:
                                links_col.update_one(
                                    {'movie_id': movie['_id'], 'source_site': site},
                                    {
                                        '$set': {
                                            'embed_url': embed,
                                            'updated_at': datetime.utcnow(),
                                            'is_active': True,
                                        }
                                    },
                                    upsert=True,
                                )
            except Exception as e:
                print(f'Error scraping {site}: {e}')
                links_col.update_many(
                    {'source_site': site}, {'$set': {'is_active': False}}
                )


if __name__ == '__main__':
    asyncio.run(scrape_all())
