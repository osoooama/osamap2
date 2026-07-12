const PROVIDERS = [
  {
    name: 'vidlink',
    url: (tmdbId: string, type: string) =>
      `https://vidlink.pro/${type}/${tmdbId}`,
    priority: 1,
  },
  {
    name: 'vidcore',
    url: (tmdbId: string, type: string) =>
      `https://www.vidcore.org/embed/${type}/${tmdbId}`,
    priority: 2,
  },
  {
    name: 'vidsrc.cc',
    url: (tmdbId: string, type: string) =>
      `https://vidsrc.cc/v2/embed/${type}/${tmdbId}`,
    priority: 3,
  },
  {
    name: 'embed.su',
    url: (tmdbId: string, type: string) =>
      `https://embed.su/embed/${type}/${tmdbId}`,
    priority: 4,
  },
  {
    name: 'vidsrc.net',
    url: (tmdbId: string, type: string) =>
      `https://vidsrc.net/embed/${type}/${tmdbId}`,
    priority: 5,
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
