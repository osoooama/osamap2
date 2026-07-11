import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

print('=== SCRAPER AUDIT ===')
errors = []

# 1. Import all modules
try:
    from sites.base import save_link, log_result, is_ad_url, detect_quality, CATEGORY_PLATFORM
    print('[OK] sites.base')
except Exception as e:
    errors.append(f'sites.base: {e}')
    print(f'[FAIL] sites.base: {e}')

try:
    from sites.cineby import crawl, get_tmdb_popular
    popular = get_tmdb_popular('movie', 3)
    print(f'[OK] sites.cineby (TMDB test: {len(popular)} movies)')
except Exception as e:
    errors.append(f'sites.cineby: {e}')
    print(f'[FAIL] sites.cineby: {e}')

try:
    from sites.anime3rb import crawl as c3
    print('[OK] sites.anime3rb')
except Exception as e:
    errors.append(f'sites.anime3rb: {e}')
    print(f'[FAIL] sites.anime3rb: {e}')

try:
    from sites.animeslayer import crawl as cs
    print('[OK] sites.animeslayer')
except Exception as e:
    errors.append(f'sites.animeslayer: {e}')
    print(f'[FAIL] sites.animeslayer: {e}')

try:
    from sites.arabic_sites import crawl as ca, SITE_CONFIGS
    print(f'[OK] sites.arabic_sites ({len(SITE_CONFIGS)} configs)')
except Exception as e:
    errors.append(f'sites.arabic_sites: {e}')
    print(f'[FAIL] sites.arabic_sites: {e}')

try:
    from sources import get_all_sites, SOURCES
    sites = get_all_sites()
    print(f'[OK] sources ({len(sites)} total, {sum(len(v) for v in SOURCES.values())} categorized)')
except Exception as e:
    errors.append(f'sources: {e}')
    print(f'[FAIL] sources: {e}')

try:
    from notifier import send_telegram_alert
    print('[OK] notifier')
except Exception as e:
    errors.append(f'notifier: {e}')
    print(f'[FAIL] notifier: {e}')

try:
    from run_all import run
    print('[OK] run_all')
except Exception as e:
    errors.append(f'run_all: {e}')
    print(f'[FAIL] run_all: {e}')

# 2. Test utility functions
print('\n=== FUNCTION TESTS ===')
try:
    ad_test = is_ad_url("https://doubleclick.net/ad") is True
    print(f'is_ad_url(doubleclick): {"PASS" if ad_test else "FAIL"}')
    ad_test2 = is_ad_url("https://play.xpass.top/e/movie/550") is False
    print(f'is_ad_url(clean): {"PASS" if ad_test2 else "FAIL"}')
    q_test = detect_quality("https://cdn.com/1080p/video.m3u8") == '1080p'
    print(f'detect_quality(1080p): {"PASS" if q_test else "FAIL"}')
    q_test2 = detect_quality("https://cdn.com/video.m3u8?quality=720") == '720p'
    print(f'detect_quality(720p): {"PASS" if q_test2 else "FAIL"}')
except NameError:
    print('[SKIP] Function tests skipped (base import failed due to missing deps)')

# 3. Test category mapping
print('\n=== CATEGORY PLATFORM MAP ===')
try:
    for cat, plat in CATEGORY_PLATFORM.items():
        print(f'  {cat} -> {plat}')
except NameError:
    print('[SKIP] base import failed')

# 4. Verify sources categories are in map
print('\n=== SOURCE CATEGORY VERIFICATION ===')
try:
    for site in get_all_sites():
        cat = site['category']
        if cat not in CATEGORY_PLATFORM:
            errors.append(f'Missing platform mapping for category: {cat}')
            print(f'[WARN] {site["name"]}: category={cat} NOT in platform map')
        else:
            print(f'[OK] {site["name"]}: {cat} -> {CATEGORY_PLATFORM[cat]}')
except NameError:
    print('[SKIP] source verification skipped (imports failed)')

# Summary
print(f'\n=== AUDIT COMPLETE ===')
if errors:
    print(f'FOUND {len(errors)} ERRORS:')
    for e in errors:
        print(f'  - {e}')
    sys.exit(1)
else:
    print('ALL CHECKS PASSED')
    sys.exit(0)
