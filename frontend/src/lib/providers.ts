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
    name: 'core',
    url: (tmdbId: string, type: string) =>
      `https://vidcore.net/${type}/${tmdbId}`,
    priority: 3,
  },
  {
    name: 'vidsrc',
    url: (tmdbId: string, type: string) =>
      `https://vidsrc.net/embed/${type}/${tmdbId}`,
    priority: 4,
  },
  {
    name: 'vid2',
    url: (tmdbId: string, type: string) =>
      `https://airflix1.com/embed/${type}/${tmdbId}`,
    priority: 5,
  },
  {
    name: 'peach',
    url: (tmdbId: string, type: string) =>
      `https://peachify.top/embed/${type}/${tmdbId}`,
    priority: 6,
  },
  {
    name: 'mapi',
    url: (tmdbId: string, type: string) =>
      `https://vidzen.fun/${type}/${tmdbId}`,
    priority: 7,
  },
  {
    name: 'vidplays',
    url: (tmdbId: string, type: string) =>
      `https://vidplays.fun/embed/${type}/${tmdbId}`,
    priority: 8,
  },
  {
    name: 'videasy',
    url: (tmdbId: string, type: string) =>
      `https://player.videasy.to/${type}/${tmdbId}`,
    priority: 9,
  },
  {
    name: 'zxcstream',
    url: (tmdbId: string, type: string) =>
      `https://v1.zxcstream.xyz/player/${type}/${tmdbId}`,
    priority: 10,
  },
  {
    name: 'cinemaos',
    url: (tmdbId: string, type: string) =>
      `https://cinemaos.tech/player/${tmdbId}`,
    priority: 11,
  },
  {
    name: 'screen',
    url: (tmdbId: string, type: string) =>
      `https://screenscape.me/embed?tmdb=${tmdbId}&type=${type}`,
    priority: 12,
  },
  {
    name: 'vixsrc',
    url: (tmdbId: string, type: string) =>
      `https://vixsrc.to/${type}/${tmdbId}?lang=en`,
    priority: 13,
  },
  {
    name: 'vidsrc.cc',
    url: (tmdbId: string, type: string) =>
      `https://vidsrc.cc/v2/embed/${type}/${tmdbId}`,
    priority: 14,
  },
  {
    name: 'embed.su',
    url: (tmdbId: string, type: string) =>
      `https://embed.su/embed/${type}/${tmdbId}`,
    priority: 15,
  },
  {
    name: 'french',
    url: (tmdbId: string, type: string) =>
      `https://frembed.hair/embed/${type}/${tmdbId}?id=${tmdbId}`,
    priority: 16,
  },
  {
    name: 'spanish',
    url: (tmdbId: string, type: string) =>
      `https://play.modocine.com/play.php/embed/${type}/${tmdbId}`,
    priority: 17,
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
