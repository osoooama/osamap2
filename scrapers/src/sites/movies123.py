"""
123moviesfree.net Scraper
Scrapes foreign movies from 123moviesfree.net
Uses curl_cffi for browsing + Playwright for JS-heavy pages
"""
import os
import sys
import re
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from curl_cffi import requests as cffi
from bs4 import BeautifulSoup
from sites.base import save_link, log_result

BASE = 'https://ww8.123moviesfree.net'
TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'b4905ea858601abd0565baa117b69b24')


def search_tmdb(title):
    if not title or len(title) < 3:
        return None
    try:
        resp = cffi.get(
            f'https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&language=ar&query={title[:50]}',
            impersonate='chrome', timeout=10
        )
        if resp.ok:
            results = resp.json().get('results', [])
            return str(results[0]['id']) if results else None
    except Exception:
        pass
    return None


def extract_title_from_slug(slug):
    parts = slug.rstrip('/').rsplit('/', 2)
    if len(parts) >= 2:
        title_part = parts[-2] if parts[-2] != 'movie' else parts[-1]
    else:
        title_part = parts[-1]
    title_part = re.sub(r'-\d+$', '', title_part)
    return title_part.replace('-', ' ').title()


def fetch_movie_listings():
    movies = []
    pages_to_scrape = [
        f'{BASE}/home/',
        f'{BASE}/genre/action/',
        f'{BASE}/genre/drama/',
        f'{BASE}/genre/thriller/',
        f'{BASE}/genre/comedy/',
        f'{BASE}/genre/sci-fi/',
        f'{BASE}/genre/horror/',
    ]

    for page_url in pages_to_scrape:
        try:
            resp = cffi.get(page_url, impersonate='chrome', timeout=15)
            if not resp.ok:
                continue
            soup = BeautifulSoup(resp.text, 'lxml')
            for a in soup.select('a[href*="/movie/"]'):
                href = a.get('href', '')
                if not href or '/movie/' not in href:
                    continue
                title_el = a.select_one('.film-name, h3, h2, .title')
                title = title_el.get_text(strip=True) if title_el else ''
                if not title:
                    title = extract_title_from_slug(href)
                full_url = href if href.startswith('http') else f'{BASE}{href}'
                if full_url not in [m['url'] for m in movies]:
                    movies.append({'url': full_url, 'title': title})
            time.sleep(0.5)
        except Exception as e:
            print(f'  [123] Error fetching {page_url}: {e}')

    return movies


def try_playwright_extract(movie_url, title):
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            page = context.new_page()
            page.goto(movie_url, wait_until='domcontentloaded', timeout=20000)
            page.wait_for_timeout(3000)

            iframes = page.query_selector_all('iframe')
            for ifr in iframes:
                src = ifr.get_attribute('src') or ''
                if src and src.startswith('http') and '123movies' not in src and 'undefined' not in src:
                    inner_resp = cffi.get(src, impersonate='chrome', timeout=10, headers={
                        'Referer': movie_url, 'Origin': BASE
                    })
                    if inner_resp.ok:
                        stream = extract_stream(inner_resp.text)
                        if stream:
                            browser.close()
                            return stream

            html = page.content()
            stream = extract_stream(html)
            browser.close()
            return stream

    except Exception as e:
        print(f'    [PW] Error: {e}')
    return None


def extract_stream(html_text):
    patterns = [
        r'(https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*)',
        r'(https?://[^\s"\'<>]+\.mp4[^\s"\'<>]*)',
        r'file\s*[:=]\s*["\']?(https?://[^\s"\'<>]+(?:\.m3u8|\.mp4)[^\s"\'<>]*)',
        r'source\s*[:=]\s*["\']?(https?://[^\s"\'<>]+(?:\.m3u8|\.mp4)[^\s"\'<>]*)',
    ]
    for pattern in patterns:
        match = re.search(pattern, html_text)
        if match:
            url = match.group(1)
            if not any(ad in url.lower() for ad in ['doubleclick', 'googlesyndication', 'adservice', 'popunder']):
                return url
    return None


def crawl(site_info):
    name = site_info.get('name', '123moviesfree.net')
    category = site_info.get('category', 'foreign')
    print(f'[123] Starting crawl for {name}...')

    total = 0
    movies = fetch_movie_listings()
    print(f'[123] Found {len(movies)} movie listings')

    for movie in movies[:15]:
        url = movie['url']
        title = movie['title']
        try:
            stream = try_playwright_extract(url, title)
            if stream:
                tmdb_id = search_tmdb(title)
                save_link(tmdb_id or title, url, stream, category, title)
                total += 1
                print(f'  [OK] {title}: {stream[:80]}...')
            else:
                print(f'  [NO STREAM] {title}')
            time.sleep(1)
        except Exception as e:
            print(f'  [ERROR] {title}: {e}')

    log_result(BASE, category, total)
    print(f'[123] {name}: {total} streams')
    return total
