import os
import requests


def send_telegram_alert(title, category, quality, embed_url):
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    if not token or not chat_id:
        print('Telegram credentials missing')
        return
    message = (
        f"*فيلم جديد تم إضافته!*\n\n"
        f"*العنوان:* {title}\n"
        f"*التصنيف:* {category}\n"
        f"*الجودة:* {quality}\n"
        f"[اضغط للمشاهدة]({embed_url})"
    )
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {'chat_id': chat_id, 'text': message, 'parse_mode': 'Markdown'}
    try:
        requests.post(url, json=payload, timeout=5)
        print(f'Telegram alert sent for {title}')
    except Exception as e:
        print(f'Failed to send alert: {e}')
