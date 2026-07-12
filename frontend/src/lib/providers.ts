export interface Provider {
  name: string;
  url: (tmdbId: string, type: string) => string;
  priority: number;
  needsResolution?: boolean;
}

const PROVIDERS: Provider[] = [
  { name: 'StreameX', url: (tmdbId, type) => `https://play.xpass.top/e/${type}/${tmdbId}`, priority: 1 },
  { name: 'vidlink', url: (tmdbId, type) => `https://vidlink.pro/${type}/${tmdbId}`, priority: 2 },
  { name: 'screenscape', url: (tmdbId, type) => `https://screenscape.me/embed?tmdb=${tmdbId}&type=${type}`, priority: 3 },
  { name: 'vidplays', url: (tmdbId, type) => `https://vidplays.fun/embed/${type}/${tmdbId}`, priority: 4 },
  { name: 'modocine', url: (tmdbId, type) => `https://play.modocine.com/play.php/embed/${type}/${tmdbId}`, priority: 5 },
  { name: 'Cinemana', url: () => 'https://cinemana.cc', priority: 18, needsResolution: true },
  { name: 'HD1', url: () => 'https://hd1.brstej.com', priority: 19, needsResolution: true },
  { name: 'Anime3rb', url: () => 'https://anime3rb.com', priority: 20, needsResolution: true },
];

export function getProviders(tmdbId: string, mediaType = 'movie') {
  return PROVIDERS.map(p => ({
    name: p.name,
    url: p.url(tmdbId, mediaType),
    priority: p.priority,
    needsResolution: p.needsResolution,
  }));
}
