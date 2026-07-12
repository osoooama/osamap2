const PROVIDERS = [
  {
    name: 'vidlink',
    url: (tmdbId: string, type: string) =>
      `https://vidlink.pro/${type}/${tmdbId}`,
    priority: 1,
  },
  {
    name: '2embed',
    url: (tmdbId: string, type: string) =>
      `https://www.2embed.skin/embed/${type}/${tmdbId}`,
    priority: 2,
  },
  {
    name: 'multiembed',
    url: (tmdbId: string, type: string) =>
      `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`,
    priority: 3,
  },
  {
    name: 'autoembed',
    url: (tmdbId: string, type: string) =>
      `https://autoembed.cc/embed/${type}/${tmdbId}`,
    priority: 4,
  },
  {
    name: 'showbox',
    url: (tmdbId: string, type: string) =>
      `https://showbox.media/embed/${type}/${tmdbId}`,
    priority: 5,
  },
  {
    name: 'vidsrc.cc',
    url: (tmdbId: string, type: string) =>
      `https://vidsrc.cc/v2/embed/${type}/${tmdbId}`,
    priority: 6,
  },
  {
    name: 'vidsrc.net',
    url: (tmdbId: string, type: string) =>
      `https://vidsrc.net/embed/${type}/${tmdbId}`,
    priority: 7,
  },
  {
    name: 'embed.su',
    url: (tmdbId: string, type: string) =>
      `https://embed.su/embed/${type}/${tmdbId}`,
    priority: 8,
  },
  {
    name: 'febox',
    url: (tmdbId: string, type: string) =>
      `https://febox.net/embed/${type}/${tmdbId}`,
    priority: 9,
  },
  {
    name: 'vidsrcb',
    url: (tmdbId: string, type: string) =>
      `https://vidsrc.biz/embed/${type}/${tmdbId}`,
    priority: 10,
  },
  {
    name: '4khdhub',
    url: (tmdbId: string, type: string) =>
      `https://4khdhub.online/embed/${type}/${tmdbId}`,
    priority: 11,
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
