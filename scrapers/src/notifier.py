import os
import re
import time
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

TELEGRAM_MAX_LENGTH = 4096


def _escape_markdown(text: str) -> str:
    """Escape special Markdown characters for Telegram."""
    return re.sub(r'([_*`\[\]])', r'\\\1', text)


def send_telegram_alert(title, category, quality, stream_url, max_retries=3):
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        print('Telegram credentials missing')
        return False

    cat_label = CATEGORY_LABELS.get(category, category)
    safe_title = _escape_markdown(str(title)[:200])
    safe_url = str(stream_url)[:500]

    msg = (
        f'🎬 *{safe_title}*\n'
        f'📂 *{cat_label}*\n'
        f'📺 {quality}\n'
        f'🔗 `{safe_url}`\n'
        f'[▶️ مشاهدة]({safe_url})'
    )

    if len(msg) > TELEGRAM_MAX_LENGTH:
        msg = msg[:TELEGRAM_MAX_LENGTH - 50] + '\n\n...(message truncated)'

    url = f'https://api.telegram.org/bot{token}/sendMessage'
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, json={
                'chat_id': chat_id,
                'text': msg,
                'parse_mode': 'Markdown',
                'disable_web_page_preview': False,
            }, timeout=10)
            resp.raise_for_status()
            print(f'Telegram alert sent: {title}')
            return True
        except requests.exceptions.HTTPError as e:
            if resp.status_code == 400 and 'parse' in resp.text.lower():
                msg_no_md = (
                    f'🎬 {title}\n'
                    f'📂 {cat_label}\n'
                    f'📺 {quality}\n'
                    f'🔗 {safe_url}'
                )
                try:
                    resp2 = requests.post(url, json={
                        'chat_id': chat_id,
                        'text': msg_no_md,
                        'disable_web_page_preview': False,
                    }, timeout=10)
                    resp2.raise_for_status()
                    print(f'Telegram alert sent (no markdown): {title}')
                    return True
                except Exception:
                    pass
            if attempt < max_retries - 1:
                time.sleep(1 * (attempt + 1))
        except Exception as e:
            print(f'Telegram error (attempt {attempt + 1}/{max_retries}): {e}')
            if attempt < max_retries - 1:
                time.sleep(1 * (attempt + 1))

    print(f'Telegram alert FAILED after {max_retries} attempts: {title}')
    return False
