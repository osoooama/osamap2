import os
import requests

EMOJI_MAP = {
    'foreign': '\U0001f30d',
    'arabic': '\U0001f319',
    'turkish': '\U0001f1f9\U0001f1f7',
    'anime': '\U0001f38c',
    'animation': '\U0001f3ac',
}


def send_telegram_alert(title: str, category: str, quality: str, stream_url: str):
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        print('Telegram credentials missing')
        return
    emoji = EMOJI_MAP.get(category, '\U0001f3a5')
    msg = (
        f'{emoji} *رابط بث جديد*\n\n'
        f'*العنوان:* {title}\n'
        f'*التصنيف:* {category}\n'
        f'*الجودة:* {quality}\n'
        f'[مشاهدة]({stream_url})'
    )
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    try:
        requests.post(url, json={
            'chat_id': chat_id,
            'text': msg,
            'parse_mode': 'Markdown',
            'disable_web_page_preview': False,
        }, timeout=10)
        print(f'Telegram alert sent: {title}')
    except Exception as e:
        print(f'Telegram error: {e}')
