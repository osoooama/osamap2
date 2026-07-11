import os
import json
from openai import OpenAI

SYSTEM_PROMPT = """You are a content classifier for streaming links. Given a URL,
determine:
  - quality: estimate from URL patterns (4k, 1080p, 720p, 480p, unknown)
  - type: vod (video on demand) or live
  - language: ar, en, tr, ja, unknown
  - is_streamable: true/false (can this be embedded in a web player)
Return JSON only."""

_client = None

def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv('DEEPSEEK_API_KEY')
        if not api_key:
            raise ValueError('DEEPSEEK_API_KEY not set')
        _client = OpenAI(api_key=api_key, base_url='https://api.deepseek.com')
    return _client


def classify_url(stream_url: str, page_title: str = '') -> dict:
    try:
        client = _get_client()
        resp = client.chat.completions.create(
            model='deepseek-chat',
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': f'URL: {stream_url}\nTitle: {page_title}'},
            ],
            temperature=0.1,
            max_tokens=150,
            response_format={'type': 'json_object'},
        )
        text = resp.choices[0].message.content
        return json.loads(text)
    except Exception as e:
        return {
            'quality': 'unknown',
            'type': 'vod',
            'language': 'unknown',
            'is_streamable': True,
            'error': str(e),
        }


def batch_classify(results: list) -> list:
    for item in results:
        for stream in item.get('streams', []):
            item['classification'] = classify_url(stream)
    return results
