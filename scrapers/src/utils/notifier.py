import os
import requests


def send_telegram_alert(title, category, quality, embed_url):
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        print('Telegram credentials missing')
        return

    emoji_map = {'foreign': '🌍', 'arabic': '🌙', 'turkish': '🇹🇷', 'anime': '🎌', 'animation': '🎬'}
    emoji = emoji_map.get(category, '🎥')

    message = (
        f"{emoji} *فيلم جديد*\n\n"
        f"*العنوان:* {title}\n"
        f"*التصنيف:* {category}\n"
        f"*الجودة:* {quality}\n"
        f"[مشاهدة]({embed_url})"
    )

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        requests.post(url, json={
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'Markdown',
            'disable_web_page_preview': False,
        }, timeout=10)
        print(f'Telegram alert sent for {title}')
    except Exception as e:
        print(f'Failed to send alert: {e}')
