import re
import asyncio
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from crawlee.crawlers import PlaywrightCrawler, PlaywrightCrawlingContext
from crawlee.router import Router

STREAMING_EXTENSIONS = ('.m3u8', '.mpd', '.mp4')
AD_KEYWORDS = ['doubleclick', 'googlesyndication', 'adservice', 'adserver',
               'popunder', 'exoclick', 'propellerads', 'adf.ly', 'shorte.st',
               'bc.vc', 'linkbucks', 'adfocus']

def is_ad_url(url):
    parsed = urlparse(url.lower())
    return any(ad in parsed.netloc or ad in parsed.path for ad in AD_KEYWORDS)

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
    pattern = re.compile(r'(https?://[^"\'\s]+\.(?:m3u8|mpd|mp4))', re.IGNORECASE)
    for match in pattern.findall(str(soup)):
        if not is_ad_url(match):
            streams.add(match)
    return list(streams)

def extract_iframe_urls(soup):
    iframes = set()
    for iframe in soup.find_all('iframe'):
        src = iframe.get('src', '')
        if src and not is_ad_url(src) and not src.startswith('data:'):
            iframes.add(src)
    return list(iframes)

class StreamingCrawler:
    def __init__(self, sites, category, tmdb_ids, concurrency=5):
        self.sites = sites
        self.category = category
        self.tmdb_ids = tmdb_ids
        self.concurrency = concurrency
        self.results = []
        self._router = Router[PlaywrightCrawlingContext]()

    async def run(self):
        self._router.default_handler(self._handle_page)
        crawler = PlaywrightCrawler(
            router=self._router,
            max_concurrency=self.concurrency,
            max_request_retries=2,
            request_handler_timeout_secs=60,
            headless=True,
        )
        urls = []
        for site in self.sites:
            base = site['url'].rstrip('/')
            for tmdb_id in self.tmdb_ids:
                urls.append(f'{base}/search/{tmdb_id}')
        await crawler.run(urls)
        return self.results

    async def _handle_page(self, context: PlaywrightCrawlingContext):
        page = context.page
        url = page.url
        html = await page.content()
        soup = BeautifulSoup(html, 'lxml')
        streams = extract_stream_urls(soup)
        iframes = extract_iframe_urls(soup)
        if streams or iframes:
            self.results.append({
                'url': url,
                'streams': streams,
                'iframes': iframes,
                'category': self.category,
            })
        await asyncio.sleep(0.5)
