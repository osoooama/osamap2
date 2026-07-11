import os
import re
import asyncio
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlparse, urljoin

import pymongo
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from crawlee.crawlers import PlaywrightCrawler, PlaywrightCrawlingContext

load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))

STREAMING_EXTENSIONS = ('.m3u8', '.mpd', '.mp4', '.ts', '.m4s')
AD_DOMAINS = [
    'doubleclick', 'googlesyndication', 'adservice', 'adserver',
    'popunder', 'exoclick', 'propellerads', 'adf.ly', 'shorte.st',
    'linkvertise', 'ouo.io', 'exe.io', 'bit.ly', 'tinyurl', 'goo.gl',
    'bc.vc', 'linkbucks', 'adfocus',
]

client = pymongo.MongoClient(os.getenv('MONGODB_URI'))
db = client['OSAMAP2_DB']
links_col = db['links']
logs_col = db['crawl_logs']


def is_ad_url(url):
    parsed = urlparse(url.lower())
    domain = parsed.netloc or parsed.path
    return any(ad in domain for ad in AD_DOMAINS)


def extract_stream_urls(soup):
    streams = set()
    for tag in soup.find_all('source'):
        src = tag.get('src', '')
        if src.endswith(STREAMING_EXTENSIONS) and not is_ad_url(src):
            streams.add(src)
    for tag in soup.find_all('video'):
        src = tag.get('src', '')
        if src.endswith(STREAMING_EXTENSIONS) and not is_ad_url(src):
            streams.add(src)
        for source in tag.find_all('source'):
            src = source.get('src', '')
            if src.endswith(STREAMING_EXTENSIONS) and not is_ad_url(src):
                streams.add(src)
    pattern = re.compile(
        r'(https?://[^"\'\s<>]+\.(?:' + '|'.join(
            ext.lstrip('.') for ext in STREAMING_EXTENSIONS
        ) + r'))',
        re.IGNORECASE,
    )
    for match in pattern.findall(str(soup)):
        if not is_ad_url(match):
            streams.add(match)
    return list(streams)


def test_stream_url(url):
    try:
        resp = requests.head(url, allow_redirects=True, timeout=10)
        if resp.status_code < 400:
            content_type = resp.headers.get('content-type', '')
            if any(t in content_type for t in ['video', 'application', 'octet', 'mp4', 'mpegurl']):
                return True
            if url.endswith('.m3u8') or url.endswith('.mpd'):
                return True
            return resp.status_code < 400
        return False
    except Exception:
        try:
            resp = requests.get(url, stream=True, timeout=10)
            return resp.status_code < 400
        except Exception:
            return False


class StreamCrawler:
    def __init__(self, category='', concurrency=5):
        self.category = category
        self.concurrency = concurrency
        self.log = []
        self._crawler = PlaywrightCrawler(headless=True)
        self._crawler.max_concurrency = concurrency
        self._crawler.max_request_retries = 3
        self._crawler.router.default_handler(self.handle_page)

    async def run(self, urls):
        await self._crawler.run(urls)

    async def handle_page(self, context: PlaywrightCrawlingContext):
        page = context.page
        url = page.url
        await page.wait_for_load_state('domcontentloaded')
        html = await page.content()
        soup = BeautifulSoup(html, 'lxml')

        all_links = set()
        for a in soup.find_all('a', href=True):
            all_links.add(urljoin(url, a['href']))
        for iframe in soup.find_all('iframe', src=True):
            all_links.add(urljoin(url, iframe['src']))
        for source in soup.find_all('source', src=True):
            all_links.add(urljoin(url, source['src']))
        for video in soup.find_all('video', src=True):
            all_links.add(urljoin(url, video['src']))

        clean_links = self.filter_ad_links(all_links)
        stream_urls = self.extract_stream_urls(list(clean_links))

        for stream_url in stream_urls:
            if test_stream_url(stream_url):
                tmdb_id = self.extract_tmdb_id(url)
                self.save_to_db(tmdb_id, url, stream_url, self.category)
                from notifier import send_telegram_alert
                send_telegram_alert(
                    f'Stream from {url}',
                    self.category,
                    '1080p',
                    stream_url,
                )

        self.log.append({
            'url': url,
            'category': self.category,
            'streams_found': len(stream_urls),
            'timestamp': datetime.now(timezone.utc),
        })
        logs_col.insert_one(self.log[-1])
        await asyncio.sleep(0.5)

    def filter_ad_links(self, links):
        return [l for l in links if not is_ad_url(l) and l.startswith('http')]

    def extract_stream_urls(self, links):
        return [l for l in links if l.rstrip('/').endswith(STREAMING_EXTENSIONS)]

    def test_stream_url(self, url):
        return test_stream_url(url)

    def save_to_db(self, tmdb_id, source, embed_url, category):
        links_col.update_one(
            {'stream_url': embed_url},
            {'$set': {
                'stream_url': embed_url,
                'source_url': source,
                'category': category,
                'is_active': True,
                'last_checked': datetime.now(timezone.utc),
                'tmdb_id': tmdb_id or '',
            }},
            upsert=True,
        )

    def extract_tmdb_id(self, url):
        match = re.search(r'(?:tmdb/|/movie/|/tv/|tmdb_id=)(\d+)', url)
        return match.group(1) if match else None

    def detect_category(self, url):
        if any(d in url for d in ['arab', 'arabic', 'seed', 'akwam', 'fasel', 'mycima', 'cimaclub',
                                    'egybest', 'shahid', 'starzplay', 'viu']):
            return 'arabic'
        if any(d in url for d in ['dizi', 'turk', 'blutv', 'puhu', 'osman', 'sinemalar',
                                    'hdfilmcehennemi', 'fullhdfilmizle']):
            return 'turkish'
        if any(d in url for d in ['anime', 'crunchyroll', 'hianime', 'jkanime', 'miruro',
                                    'aniwave', 'witanime']):
            return 'anime'
        return 'foreign'


def create_crawler(urls, category='foreign'):
    return StreamCrawler(category=category), urls
