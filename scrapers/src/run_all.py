import sys, asyncio, time
sys.path.insert(0, 'src')
from datetime import datetime, timezone
import pymongo, os
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))

from sources import get_all_sites, SOURCES
from crawler import StreamCrawler
from notifier import send_telegram_alert

all_sites = get_all_sites()
results = {'success': 0, 'failed': 0, 'streams_found': 0, 'details': []}

def pick_sites(category, count):
    return [s for s in all_sites if s['category'] == category][:count]

async def run_batch(category, sites, tmdb_ids, sem):
    tasks = []
    for site in sites:
        tasks.append(run_site(site, tmdb_ids, sem))
    await asyncio.gather(*tasks)

async def run_site(site, tmdb_ids, sem):
    async with sem:
        cat = site['category']
        name = site['name']
        base = site['url'].rstrip('/')
        urls = [f'{base}/search/{tid}' for tid in tmdb_ids]
        c = StreamCrawler(category=cat, concurrency=min(len(urls), 3))
        t0 = time.time()
        try:
            await c.run(urls)
            elapsed = time.time() - t0
            for log in c.log:
                results['streams_found'] += len(log.get('streams_found', 0))
            results['success'] += 1
            results['details'].append({'name': name, 'category': cat, 'status': 'OK', 'time': f'{elapsed:.1f}s'})
            print(f'  OK  [{cat:8}] {name:25} {elapsed:.1f}s')
        except Exception as e:
            elapsed = time.time() - t0
            results['failed'] += 1
            err = str(e)[:40]
            results['details'].append({'name': name, 'category': cat, 'status': 'FAIL', 'time': f'{elapsed:.1f}s'})
            print(f'  FAIL [{cat:8}] {name:25} {elapsed:.1f}s - {err}')

async def main():
    print(f'Running crawler on ALL 80 sites...')
    sem = asyncio.Semaphore(4)
    tmdb_ids = ['550']
    for cat in ['foreign', 'arabic', 'turkish', 'anime']:
        sites = [s for s in all_sites if s['category'] == cat]
        print(f'\n--- {cat.upper()} ({len(sites)} sites) ---')
        tasks = [run_site(site, tmdb_ids, sem) for site in sites]
        await asyncio.gather(*tasks)

    print('\n' + '=' * 70)
    print('CATEGORY BREAKDOWN:')
    for cat in ['foreign', 'arabic', 'turkish', 'anime']:
        cat_sites = [d for d in results['details'] if d['category'] == cat]
        ok = sum(1 for d in cat_sites if d['status'] == 'OK')
        fail = sum(1 for d in cat_sites if d['status'] != 'OK')
        print(f'  {cat:10}: {ok} OK / {fail} FAIL')

    print(f'\nTOTALS:')
    print(f'  Total sites: {len(all_sites)}')
    print(f'  Success: {results["success"]}')
    print(f'  Failed: {results["failed"]}')
    print(f'  Streams found: {results["streams_found"]}')

    send_telegram_alert(
        f'Scraper Report: {results["success"]}/{len(all_sites)} sites OK, {results["streams_found"]} streams',
        'all', 'report', 'https://github.com/osoooama/osamap2/actions'
    )

if __name__ == '__main__':
    asyncio.run(main())
