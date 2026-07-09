import asyncio
import re
import random
from playwright.async_api import async_playwright


class BaseScraper:
    def __init__(self):
        self.timeout = 15000

    async def get_page(self, url):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            page = await context.new_page()
            await page.goto(url, timeout=self.timeout)
            await asyncio.sleep(random.uniform(3, 7))
            content = await page.content()
            await browser.close()
            return content

    def extract_iframe(self, html):
        pattern = r'<iframe[^>]*src=["\']([^"\']*embed[^"\']*|.*watch[^"\']*)["\'][^>]*>'
        match = re.search(pattern, html)
        return match.group(1) if match else None

    def extract_tmdb_id(self, url):
        match = re.search(r'(?:tmdb/|/movie/|/tv/)(\d+)', url)
        return match.group(1) if match else None
