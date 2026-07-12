import os
import re
import time
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlparse, urljoin

import pymongo
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import cloudscraper

load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))

STREAMING_EXTENSIONS = ('.m3u8', '.mpd', '.mp4', '.webm', '.ts', '.mkv', '.mov',
    '.avi', '.flv', '.f4m', '.ism', '.isml', '.m3u')
AD_DOMAINS = [
    'doubleclick', 'googlesyndication', 'adservice', 'adserver',
    'popunder', 'exoclick', 'propellerads', 'adf.ly', 'shorte.st',
    'linkvertise', 'ouo.io', 'exe.io', 'bit.ly', 'tinyurl', 'goo.gl',
    'bc.vc', 'linkbucks', 'adfocus', 'dtscout', 'sharethis',
]

DB_URI = os.getenv('MONGODB_URI')
links_col = logs_col = None
if DB_URI:
    try:
        client = pymongo.MongoClient(DB_URI, serverSelectionTimeoutMS=5000)
        db = client['OSAMAP2_DB']
        links_col = db['links']
        logs_col = db['crawl_logs']
    except Exception as e:
        print(f'[DB INIT WARN] {e}')


def is_ad_url(url):
    parsed = urlparse(url.lower())
    domain = parsed.netloc or parsed.path
    return any(ad in domain for ad in AD_DOMAINS)


def has_stream_extension(url):
    if not url:
        return False
    path = urlparse(url.lower()).path
    return any(path.endswith(ext) for ext in STREAMING_EXTENSIONS)


def extract_stream_urls(soup):
    streams = set()
    for tag in soup.find_all('source'):
        src = tag.get('src', '')
        if has_stream_extension(src) and not is_ad_url(src):
            streams.add(src)
    for tag in soup.find_all('video'):
        src = tag.get('src', '')
        if has_stream_extension(src) and not is_ad_url(src):
            streams.add(src)
        for source in tag.find_all('source'):
            src = source.get('src', '')
            if has_stream_extension(src) and not is_ad_url(src):
                streams.add(src)
    pattern = re.compile(
        r'(https?://[^"\'\s<>]+\.(?:' + '|'.join(
            ext.lstrip('.') for ext in STREAMING_EXTENSIONS
        ) + r')(?:\?[^\s"\'<>]*)?)',
        re.IGNORECASE,
    )
    for match in pattern.findall(str(soup)):
        if not is_ad_url(match):
            streams.add(match)
    return list(streams)


def fetch_page_requests(url, timeout=15):
    scraper = cloudscraper.create_scraper()
    try:
        resp = scraper.get(url, timeout=timeout, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        })
        if resp.status_code < 400:
            return resp.text
    except Exception:
        pass
    return None


class StreamCrawler:
    def __init__(self, category=''):
        self.category = category
        self.log = []
        self.scraper = cloudscraper.create_scraper()

    def crawl(self, urls):
        for url in urls:
            print(f'[CRAWL] {url}')
            html = fetch_page_requests(url)
            if not html:
                print(f'  [FAIL] cloudscraper failed for {url}')
                entry = {
                    'url': url, 'category': self.category,
                    'streams_found': 0, 'error': 'cloudscraper failed',
                    'timestamp': datetime.now(timezone.utc),
                }
                self.log.append(entry)
                if logs_col is not None:
                    try:
                        logs_col.insert_one(entry)
                    except:
                        pass
                continue

            soup = BeautifulSoup(html, 'lxml')
            stream_urls = extract_stream_urls(soup)

            if stream_urls:
                print(f'  [OK] Found {len(stream_urls)} streams on {url}')
                for s in stream_urls[:3]:
                    print(f'    - {s}')
                for stream_url in stream_urls:
                    tmdb_id = self.extract_tmdb_id(url)
                    self.save_to_db(tmdb_id, url, stream_url, self.category)
                    from notifier import send_telegram_alert
                    send_telegram_alert(
                        f'Stream from {url}', self.category, 'Auto', stream_url,
                    )
            else:
                print(f'  [NO STREAMS] {url}')

            entry = {
                'url': url, 'category': self.category,
                'streams_found': len(stream_urls),
                'timestamp': datetime.now(timezone.utc),
            }
            self.log.append(entry)
            if logs_col is not None:
                try:
                    logs_col.insert_one(entry)
                except:
                    pass
            time.sleep(1)

    def save_to_db(self, tmdb_id, source, stream_url, category):
        if links_col is None:
            return
        try:
            links_col.update_one(
                {'stream_url': stream_url},
                {'$set': {
                    'stream_url': stream_url,
                    'source_url': source,
                    'category': category,
                    'is_active': True,
                    'last_checked': datetime.now(timezone.utc),
                    'tmdb_id': tmdb_id or '',
                }},
                upsert=True,
            )
        except Exception as e:
            print(f'    [DB SAVE ERROR] {e}')

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
