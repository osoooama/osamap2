import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

SYSTEM_PROMPT = (
    'Classify the following movie into exactly one category from: '
    'Action, Drama, Comedy, Romance, Sci-Fi, Horror, Adventure, Animation, Documentary. '
    'Return valid JSON only: {"category": "...", "confidence": 0.0-1.0}'
)


def extract_category_from_response(text):
    try:
        data = json.loads(text)
        return data.get('category', 'Unknown'), float(data.get('confidence', 0.0))
    except (json.JSONDecodeError, TypeError, ValueError):
        return 'Unknown', 0.0


class DeepSeekClassifier:
    def __init__(self):
        api_key = os.getenv('DEEPSEEK_API_KEY')
        if not api_key:
            raise ValueError('DEEPSEEK_API_KEY not found in environment')
        self.client = OpenAI(api_key=api_key, base_url='https://api.deepseek.com')

    def classify(self, title, overview):
        try:
            resp = self.client.chat.completions.create(
                model='deepseek-chat',
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': f'Title: {title}\nOverview: {overview}'},
                ],
                temperature=0.1,
                max_tokens=100,
            )
            content = resp.choices[0].message.content
            category, confidence = extract_category_from_response(content)
            return {'category': category, 'confidence': confidence}
        except Exception as e:
            return {'category': 'Unknown', 'confidence': 0.0, 'error': str(e)}
