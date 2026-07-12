export interface Provider {
  name: string;
  url: (tmdbId: string, type: string) => string;
  priority: number;
  working: boolean;
}

const PROVIDERS: Provider[] = [
  { name: 'StreameX', url: (tmdbId: string, type: string) => `https://play.xpass.top/e/${type}/${tmdbId}`, priority: 1, working: true },
  { name: 'vidlink', url: (tmdbId: string, type: string) => `https://vidlink.pro/${type}/${tmdbId}`, priority: 2, working: true },
  { name: 'screen', url: (tmdbId: string, type: string) => `https://screenscape.me/embed?tmdb=${tmdbId}&type=${type}`, priority: 3, working: true },
  { name: 'vidplays', url: (tmdbId: string, type: string) => `https://vidplays.fun/embed/${type}/${tmdbId}`, priority: 4, working: true },
  { name: 'spanish', url: (tmdbId: string, type: string) => `https://play.modocine.com/play.php/embed/${type}/${tmdbId}`, priority: 5, working: true },
  { name: 'core', url: (tmdbId: string, type: string) => `https://vidcore.net/${type}/${tmdbId}`, priority: 6, working: false },
  { name: 'vidsrc', url: (tmdbId: string, type: string) => `https://vidsrc.net/embed/${type}/${tmdbId}`, priority: 7, working: false },
  { name: 'vid2', url: (tmdbId: string, type: string) => `https://airflix1.com/embed/${type}/${tmdbId}`, priority: 8, working: false },
  { name: 'peach', url: (tmdbId: string, type: string) => `https://peachify.top/embed/${type}/${tmdbId}`, priority: 9, working: false },
  { name: 'mapi', url: (tmdbId: string, type: string) => `https://vidzen.fun/${type}/${tmdbId}`, priority: 10, working: false },
  { name: 'videasy', url: (tmdbId: string, type: string) => `https://player.videasy.to/${type}/${tmdbId}`, priority: 11, working: false },
  { name: 'zxcstream', url: (tmdbId: string, type: string) => `https://v1.zxcstream.xyz/player/${type}/${tmdbId}`, priority: 12, working: false },
  { name: 'cinemaos', url: (tmdbId: string, type: string) => `https://cinemaos.tech/player/${tmdbId}`, priority: 13, working: false },
  { name: 'vixsrc', url: (tmdbId: string, type: string) => `https://vixsrc.to/${type}/${tmdbId}?lang=en`, priority: 14, working: false },
  { name: 'vidsrc.cc', url: (tmdbId: string, type: string) => `https://vidsrc.cc/v2/embed/${type}/${tmdbId}`, priority: 15, working: false },
  { name: 'embed.su', url: (tmdbId: string, type: string) => `https://embed.su/embed/${type}/${tmdbId}`, priority: 16, working: false },
  { name: 'french', url: (tmdbId: string, type: string) => `https://frembed.hair/embed/${type}/${tmdbId}?id=${tmdbId}`, priority: 17, working: false },
].sort((a, b) => a.priority - b.priority);

export function getProviderUrls(tmdbId: string, mediaType: string = 'movie'): string[] {
  return PROVIDERS.map((p) => p.url(tmdbId, mediaType));
}

export function getProvidersWithPriority(tmdbId: string, mediaType: string = 'movie') {
  return PROVIDERS.map((p) => ({
    name: p.name,
    url: p.url(tmdbId, mediaType),
    priority: p.priority,
    working: p.working,
  }));
}
