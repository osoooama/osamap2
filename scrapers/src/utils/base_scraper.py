import asyncio
import re
import random
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from playwright.async_api import async_playwright


class BaseScraper:
    def __init__(self):
        self.ua = UserAgent(browsers=['chrome'])
        self.timeout = 30000

    async def get_page(self, url, use_js=False):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=self.ua.random,
                viewport={'width': 1920, 'height': 1080},
                locale='ar'
            )
            page = await context.new_page()
            try:
                await page.goto(url, timeout=self.timeout, wait_until='domcontentloaded')
                await asyncio.sleep(random.uniform(3, 7))
                content = await page.content()
            except Exception:
                content = None
            finally:
                await browser.close()
            return content

    def extract_iframe(self, html):
        soup = BeautifulSoup(html, 'lxml')
        for iframe in soup.find_all('iframe'):
            src = iframe.get('src', '')
            if src and ('embed' in src.lower() or 'watch' in src.lower() or 'player' in src.lower()):
                return src
        pattern = r'<iframe[^>]*src=["\']([^"\']+)["\']'
        match = re.search(pattern, html)
        return match.group(1) if match else None

    def extract_video(self, html):
        soup = BeautifulSoup(html, 'lxml')
        for vid in soup.find_all('source'):
            src = vid.get('src', '')
            if src.endswith(('.mp4', '.m3u8')):
                return src
        for vid in soup.find_all('video'):
            src = vid.get('src', '')
            if src.endswith(('.mp4', '.m3u8')):
                return src
        pattern = r'(https?://[^"\']+\.(?:mp4|m3u8))'
        match = re.search(pattern, html)
        return match.group(1) if match else None

    def extract_tmdb_id(self, url):
        match = re.search(r'(?:tmdb/|/movie/|/tv/)(\d+)', url)
        return match.group(1) if match else None
