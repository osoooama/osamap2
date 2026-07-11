import os
from pathlib import Path
import requests
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))

AD_DOMAINS = [
    'googleads', 'doubleclick', 'adservice', 'adserver', 'popunder',
    'exoclick', 'propellerads', 'adf.ly', 'shorte.st', 'linkvertise',
    'ouo.io', 'exe.io', 'bit.ly', 'tinyurl', 'goo.gl', 'bc.vc',
    'linkbucks', 'adfocus', 'shrinkme.io', 'sh.st', 'cee.ph',
]


def is_ad_or_shortened(url):
    parsed = urlparse(url.lower())
    domain = parsed.netloc or parsed.path
    return any(ad in domain for ad in AD_DOMAINS)


def clean_telegram_link(url):
    if not url or is_ad_or_shortened(url):
        return None
    try:
        resp = requests.get(url, allow_redirects=True, timeout=10, stream=True)
        resolved = resp.url
        if is_ad_or_shortened(resolved):
            return None
        return resolved
    except Exception:
        return None


def send_telegram_alert(title, category, quality, embed_url):
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        print('Telegram credentials missing')
        return
    clean_url = clean_telegram_link(embed_url)
    if not clean_url:
        print(f'Skipped ad/shortened URL: {embed_url}')
        return
    msg = (
        '\U0001f3ac *فيلم جديد!*\n'
        f'\U0001f4cc *العنوان:* {title}\n'
        f'\U0001f4c2 *التصنيف:* {category}\n'
        f'\U0001f4fa *الجودة:* {quality}\n'
        f'\U0001f517 [مشاهدة]({clean_url})'
    )
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    try:
        resp = requests.post(url, json={
            'chat_id': chat_id,
            'text': msg,
            'parse_mode': 'Markdown',
            'disable_web_page_preview': False,
        }, timeout=10)
        resp.raise_for_status()
        print(f'Telegram alert sent: {title}')
    except Exception as e:
        print(f'Telegram error: {e}')
