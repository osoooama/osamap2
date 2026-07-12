import axios from 'axios';

const CINEMANA_BASE = 'https://cinemana.cc';
const HD1_BASE = 'https://hd1.brstej.com';
const ANIME3RB_BASE = 'https://anime3rb.com';

const TMDB_KEY = process.env.TMDB_API_KEY || 'b4905ea858601abd0565baa117b69b24';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function getTmdbTitle(tmdbId: string): Promise<string | null> {
  try {
    const { data } = await axios.get(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}`, { timeout: 8000 });
    return data.title || null;
  } catch {
    try {
      const { data } = await axios.get(`${TMDB_BASE}/tv/${tmdbId}?api_key=${TMDB_KEY}`, { timeout: 8000 });
      return data.name || null;
    } catch {
      return null;
    }
  }
}

export async function resolveCinemana(tmdbId: string): Promise<string | null> {
  const title = await getTmdbTitle(tmdbId);
  if (!title) return null;

  try {
    const { data } = await axios.get(`${CINEMANA_BASE}/?s=${encodeURIComponent(title)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000,
    });
    const match = data.match(/href=["']([^"']*\/watch=\d+[^"']*)["']/);
    if (match) {
      const href = match[1];
      return href.startsWith('http') ? href : `${CINEMANA_BASE}${href}`;
    }
    return null;
  } catch {
    return null;
  }
}

export async function resolveHd1(tmdbId: string): Promise<string | null> {
  const title = await getTmdbTitle(tmdbId);
  if (!title) return null;

  try {
    const { data } = await axios.post(`${HD1_BASE}/ajax-search.php`,
      new URLSearchParams({ q: title }),
      { headers: { 'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 }
    );
    const vidMatch = data.match(/vid=([a-f0-9]{9})/);
    if (vidMatch) {
      return `${HD1_BASE}/embed.php?vid=${vidMatch[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

export async function resolveAnime3rb(tmdbId: string): Promise<string | null> {
  const title = await getTmdbTitle(tmdbId);
  if (!title) return null;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  try {
    const { data } = await axios.get(`${ANIME3RB_BASE}/episode/${slug}/1`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000,
    });
    const match = data.match(/<iframe[^>]*src=["']([^"']*vid3rb[^"']*)["']/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function resolveProvider(tmdbId: string, provider: string): Promise<string | null> {
  switch (provider) {
    case 'cinemana': return resolveCinemana(tmdbId);
    case 'hd1': return resolveHd1(tmdbId);
    case 'anime3rb': return resolveAnime3rb(tmdbId);
    default: return null;
  }
}
