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

function generateEmbedUrls(tmdbId: string, mediaType: 'movie' | 'tv', season?: number, episode?: number): EmbedSource[] {
  const sources: EmbedSource[] = [];
  const t = tmdbId;

  if (mediaType === 'movie') {
    const patterns = [
      { url: `https://vidfast.pro/movie/${t}?autoPlay=true`, provider: 'vidfast' },
      { url: `https://vidlink.pro/movie/${t}`, provider: 'vidlink' },
      { url: `https://vidsrc.pm/embed/movie/${t}`, provider: 'vidsrc' },
      { url: `https://www.2embed.skin/embed/${t}`, provider: '2embed' },
      { url: `https://vidsrc.to/embed/movie/${t}`, provider: 'vidsrc' },
      { url: `https://vidsrc.cc/v2/embed/movie/${t}`, provider: 'vidsrc' },
      { url: `https://www.2embed.cc/embed/${t}`, provider: '2embed' },
      { url: `https://www.nontongo.win/embed/${t}`, provider: 'nontongo' },
      { url: `https://autoembed.co/movie/tmdb/${t}`, provider: 'autoembed' },
      { url: `https://moviesapi.to/movie/${t}`, provider: 'moviesapi' },
      { url: `https://player.smashystream.com/playere.php?tmdb=${t}`, provider: 'smashystream' },
      { url: `https://frembed.icu/api/film.php?id=${t}`, provider: 'frembed' },
    ];
    for (const p of patterns) {
      sources.push({ url: p.url, provider: p.provider, type: 'embed' });
    }
  } else if (mediaType === 'tv' && season && episode) {
    const patterns = [
      { url: `https://vidfast.pro/tv/${t}/${season}/${episode}?autoPlay=true`, provider: 'vidfast' },
      { url: `https://vidlink.pro/tv/${t}/${season}/${episode}`, provider: 'vidlink' },
      { url: `https://vidsrc.pm/embed/tv/${t}/${season}/${episode}`, provider: 'vidsrc' },
      { url: `https://www.2embed.skin/embed/${t}?s=${season}&e=${episode}`, provider: '2embed' },
      { url: `https://vidsrc.to/embed/tv/${t}/${season}/${episode}`, provider: 'vidsrc' },
      { url: `https://vidsrc.cc/v2/embed/tv/${t}/${season}/${episode}`, provider: 'vidsrc' },
      { url: `https://www.2embed.cc/embed/${t}?s=${season}&e=${episode}`, provider: '2embed' },
      { url: `https://www.nontongo.win/embed/${t}?s=${season}&e=${episode}`, provider: 'nontongo' },
      { url: `https://autoembed.co/tv/tmdb/${t}/${season}/${episode}`, provider: 'autoembed' },
      { url: `https://moviesapi.to/tv/${t}/${season}/${episode}`, provider: 'moviesapi' },
      { url: `https://player.smashystream.com/playere.php?tmdb=${t}&season=${season}&episode=${episode}`, provider: 'smashystream' },
      { url: `https://frembed.icu/api/serie.php?id=${t}&sa=${season}&epi=${episode}`, provider: 'frembed' },
    ];
    for (const p of patterns) {
      sources.push({ url: p.url, provider: p.provider, type: 'embed' });
    }
  }

  return sources;
}

export async function getEmbedUrls(tmdbId: string, mediaType: 'movie' | 'tv', season?: number, episode?: number): Promise<EmbedSource[]> {
  return generateEmbedUrls(tmdbId, mediaType, season, episode);
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
