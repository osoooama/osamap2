const PROVIDERS = [
  {
    name: 'StreameX',
    url: (tmdbId: string, type: string) =>
      `https://play.xpass.top/e/${type}/${tmdbId}`,
    priority: 1,
  },
  {
    name: 'vidlink',
    url: (tmdbId: string, type: string) =>
      `https://vidlink.pro/${type}/${tmdbId}`,
    priority: 2,
  },
  {
    name: 'vidcore',
    url: (tmdbId: string, type: string) =>
      `https://www.vidcore.org/embed/${type}/${tmdbId}`,
    priority: 3,
  },
  {
    name: 'vidsrc',
    url: (tmdbId: string, type: string) =>
      `https://vidsrc.net/embed/${type}/${tmdbId}`,
    priority: 4,
  },
  {
    name: 'vidsrc.cc',
    url: (tmdbId: string, type: string) =>
      `https://vidsrc.cc/v2/embed/${type}/${tmdbId}`,
    priority: 5,
  },
  {
    name: 'embed.su',
    url: (tmdbId: string, type: string) =>
      `https://embed.su/embed/${type}/${tmdbId}`,
    priority: 6,
  },
  {
    name: 'vid2',
    url: (tmdbId: string, type: string) =>
      `https://vid2.su/embed/${type}/${tmdbId}`,
    priority: 7,
  },
  {
    name: 'movie-web',
    url: (tmdbId: string, type: string) =>
      `https://movie-web.app/media/${type}?tmdb=${tmdbId}`,
    priority: 8,
  },
  {
    name: 'vidplay',
    url: (tmdbId: string, type: string) =>
      `https://vidplay.su/embed/${type}/${tmdbId}`,
    priority: 9,
  },
  {
    name: 'superembed',
    url: (tmdbId: string, type: string) =>
      `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`,
    priority: 10,
  },
  {
    name: 'cinemaos',
    url: (tmdbId: string, type: string) =>
      `https://cinemaos.sbs/embed/${type}/${tmdbId}`,
    priority: 11,
  },
  {
    name: 'zxcstream',
    url: (tmdbId: string, type: string) =>
      `https://zxcstream.com/embed/${type}/${tmdbId}`,
    priority: 12,
  },
  {
    name: 'videasy',
    url: (tmdbId: string, type: string) =>
      `https://videasy.net/embed/${type}/${tmdbId}`,
    priority: 13,
  },
  {
    name: 'mapi',
    url: (tmdbId: string, type: string) =>
      `https://mapi.sbs/embed/${type}/${tmdbId}`,
    priority: 14,
  },
].sort((a, b) => a.priority - b.priority);

export function getProviderUrls(tmdbId: string, mediaType: string = 'movie'): string[] {
  return PROVIDERS.map((p) => p.url(tmdbId, mediaType));
}

export function getProvidersWithPriority(tmdbId: string, mediaType: string = 'movie') {
  return PROVIDERS.map((p) => ({
    name: p.name,
    url: p.url(tmdbId, mediaType),
    priority: p.priority,
  }));
}
