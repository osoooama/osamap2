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
  { name: 'VidCore', url: (tmdbId, type) => `https://vidcore.org/embed/${type}/${tmdbId}`, priority: 6 },
  { name: 'apiplayer', url: (tmdbId, type) => `https://apiplayer.ru/embed/${type}/${tmdbId}`, priority: 7 },
  { name: '2embed', url: (tmdbId, type) => `https://www.2embed.stream/embed/${type}/${tmdbId}`, priority: 8 },
  { name: 'VidFast', url: (tmdbId, type) => `https://vidfast.pro/${type}/${tmdbId}`, priority: 9 },
  { name: 'VidEasy', url: (tmdbId, type) => `https://player.videasy.net/${type}/${tmdbId}`, priority: 10 },
  { name: 'SmashyStream', url: (tmdbId, type) => `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`, priority: 11 },
  { name: 'Frembed', url: (tmdbId, type) => type === 'tv' ? `https://frembed.hair/api/serie.php?id=${tmdbId}&sa=1&epi=1` : `https://frembed.hair/embed/movie/${tmdbId}`, priority: 12 },
  { name: 'VidKing', url: (tmdbId, type) => `https://www.vidking.net/embed/${type}/${tmdbId}?autoPlay=true`, priority: 13 },
  { name: 'VidNest', url: (tmdbId, type) => `https://vidnest.fun/${type}/${tmdbId}`, priority: 14 },
  { name: 'VidRift', url: (tmdbId, type) => `https://vidrift.in/embed/${type}/${tmdbId}`, priority: 15 },
  { name: 'VidLove', url: (tmdbId, type) => `https://player.vidlove.cc/embed/${type}/${tmdbId}`, priority: 16 },
  { name: 'Cinemana', url: () => 'https://cinemana.cc', priority: 18, needsResolution: true },
  { name: 'HD1', url: () => 'https://hd1.brstej.com', priority: 19, needsResolution: true },
  { name: 'Anime3rb', url: () => 'https://anime3rb.com', priority: 20, needsResolution: true },
];

const AD_BLOCK_PARAMS = ['ads=0', 'ad=0', 'no-ad=1', 'anti_ad=1', 'hideAd=1'];

export function addArabicSubs(url: string): string {
  let result = url;
  const separator = result.includes('?') ? '&' : '?';
  if (!result.includes('sub=')) result = `${result}${separator}sub=ar`;
  for (const p of AD_BLOCK_PARAMS) {
    if (!result.includes(p.split('=')[0])) {
      result = `${result}${result.includes('?') ? '&' : '?'}${p}`;
    }
  }
  return result;
}

export function getProviders(tmdbId: string, mediaType = 'movie') {
  return PROVIDERS.map(p => ({
    name: p.name,
    url: addArabicSubs(p.url(tmdbId, mediaType)),
    priority: p.priority,
    needsResolution: p.needsResolution,
  }));
}
