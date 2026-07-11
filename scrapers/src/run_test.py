"""Quick test: 1 site from each category to verify sandbox fix works on GitHub Actions."""
import asyncio
import pymongo
import os
from pathlib import Path
from dotenv import load_dotenv
from crawlee.crawlers import PlaywrightCrawler, PlaywrightCrawlingContext

load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))

TEST_URLS = [
    "https://cineby.cc/search/550",
    "https://faselplus.cc/search/550",
    "https://kayifamily.com/search/550",
    "https://hianime.to/search/550",
]

async def main():
    seen = set()
    found_streams = []

    crawler = PlaywrightCrawler(
        headless=True,
        browser_launch_options={'args': ['--no-sandbox', '--disable-setuid-sandbox']},
    )
    crawler.max_concurrency = 2
    crawler.max_request_retries = 1

    @crawler.router.default_handler
    async def handler(context: PlaywrightCrawlingContext):
        page = context.page
        html = await page.content()
        if page.url not in seen:
            seen.add(page.url)
            print(f"[OK] Loaded: {page.url} ({len(html)} bytes)")
        # Check for stream URLs
        for ext in ['.m3u8', '.mpd', '.mp4', '.ts']:
            if ext in html:
                found_streams.append(page.url)
                print(f"  >>> Found {ext} on {page.url}")

    try:
        await crawler.run(TEST_URLS)
    except Exception as e:
        print(f"[ERROR] {e}")

    print(f"\n=== RESULTS ===")
    print(f"Total requested: {len(TEST_URLS)}")
    print(f"Total loaded: {len(seen)}")
    print(f"Streams found: {len(found_streams)} sites")
    for s in found_streams:
        print(f"  - {s}")

if __name__ == '__main__':
    asyncio.run(main())
