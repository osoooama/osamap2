import os
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.joinpath('.env'))

CATEGORY_LABELS = {
    'foreign': '🎬 Netflix - أفلام عالمية',
    'arabic': '🇸🇦 Shahid - عربي',
    'turkish': '🇹🇷 Shahid - تركي',
    'anime': '🇯🇵 Crunchyroll - أنمي',
    'animation': '🎨 Disney+ - أنيميشن',
}


def send_telegram_alert(title, category, quality, stream_url):
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        print('Telegram credentials missing')
        return

    cat_label = CATEGORY_LABELS.get(category, category)
    msg = (
        f'🎬 *{title}*\n'
        f'📂 *{cat_label}*\n'
        f'📺 {quality}\n'
        f'🔗 `{stream_url}`\n'
        f'[▶️ مشاهدة]({stream_url})'
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
