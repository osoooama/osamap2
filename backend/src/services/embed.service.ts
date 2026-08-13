import axios from 'axios';

const TMDB_EMBED_API_URL = process.env.TMDB_EMBED_API_URL || '';

interface EmbedSource {
  url: string;
  provider: string;
  quality?: string;
  type: 'embed' | 'direct';
}

function urlToProvider(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'unknown';
  }
}

export async function getEmbedUrls(tmdbId: string, mediaType: 'movie' | 'tv', season?: number, episode?: number): Promise<EmbedSource[]> {
  const sources: EmbedSource[] = [];

  try {
    const { buildMovieSources, buildTvSources } = await import('tmdb-embed-providers');

    if (mediaType === 'movie') {
      const urls: string[] = buildMovieSources(Number(tmdbId));
      for (const url of urls) {
        if (url) {
          sources.push({
            url,
            provider: urlToProvider(url),
            type: 'embed',
          });
        }
      }
    } else if (mediaType === 'tv' && season && episode) {
      const urls: string[] = buildTvSources(Number(tmdbId), season, episode);
      for (const url of urls) {
        if (url) {
          sources.push({
            url,
            provider: urlToProvider(url),
            type: 'embed',
          });
        }
      }
    }
  } catch (err) {
    console.error('[EMBED] Error generating embed URLs:', err);
  }

  return sources;
}

export async function getEmbedFromApi(tmdbId: string, mediaType: 'movie' | 'tv'): Promise<EmbedSource[]> {
  if (!TMDB_EMBED_API_URL) return [];

  try {
    const { data } = await axios.get(`${TMDB_EMBED_API_URL}/api/streams/${mediaType}/${tmdbId}`, {
      timeout: 10000,
    });

    if (data?.streams && Array.isArray(data.streams)) {
      return data.streams.map((s: Record<string, unknown>) => ({
        url: String(s.url || ''),
        provider: String(s.provider || 'tmdb-embed-api'),
        quality: s.quality ? String(s.quality) : undefined,
        type: 'embed' as const,
      })).filter((s: EmbedSource) => s.url);
    }
  } catch (err) {
    console.error('[EMBED] TMDB-Embed-API error:', err);
  }

  return [];
}

export async function getAllEmbedSources(
  tmdbId: string,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number,
): Promise<EmbedSource[]> {
  const npmSources = await getEmbedUrls(tmdbId, mediaType, season, episode);
  const apiSources = await getEmbedFromApi(tmdbId, mediaType);

  const seen = new Set<string>();
  const all: EmbedSource[] = [];

  for (const s of [...apiSources, ...npmSources]) {
    if (s.url && !seen.has(s.url)) {
      seen.add(s.url);
      all.push(s);
    }
  }

  return all;
}
