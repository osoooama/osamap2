import axios from 'axios';

export async function classifyMovie(title: string, overview: string): Promise<string> {
  const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'Classify this movie into exactly one category: foreign, arabic, turkish, anime, animation. Return only the category word.' },
      { role: 'user', content: `Title: ${title}. Overview: ${overview}` }
    ],
    stream: false
  }, { headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` } });
  return response.data.choices[0].message.content;
}
