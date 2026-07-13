export interface Provider {
  name: string;
  displayName?: string;
  brandColor?: string;
  url: (tmdbId: string, type: string) => string;
  priority: number;
  needsResolution?: boolean;
}

export const BRANDED: Record<string, { displayName: string; color: string; glow: string }> = {
  vidlink: { displayName: 'OSK+', color: '#ffd700', glow: '#ffd700' },
  apiplayer: { displayName: 'OSK+ Pro', color: '#ff3333', glow: '#ff0000' },
  VidLove: { displayName: 'OSK+ Gold', color: '#ffd700', glow: '#ffaa00' },
};

const PROVIDERS: Provider[] = [
  // Tier 1: Best Overall (Most Reliable)
  { name: 'ezvidapi', url: (tmdbId, type) => `https://ezvidapi.com/embed/${type}/${tmdbId}`, priority: 1 },
  { name: 'VixSrc', url: (tmdbId, type) => `https://vixsrc.to/${type}/${tmdbId}`, priority: 2 },
  { name: 'StreameX', url: (tmdbId, type) => `https://play.xpass.top/e/${type}/${tmdbId}`, priority: 3 },
  { name: 'vidlink', url: (tmdbId, type) => `https://vidlink.pro/${type}/${tmdbId}`, priority: 4 },

  // Tier 2: Reliable Alternatives
  { name: 'VidCore', url: (tmdbId, type) => `https://www.vidcore.org/embed/${type}/${tmdbId}`, priority: 5 },
  { name: 'apiplayer', url: (tmdbId, type) => `https://apiplayer.ru/embed/${type}/${tmdbId}`, priority: 6 },
  { name: 'SuperEmbed', url: (tmdbId, type) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`, priority: 7 },
  { name: 'screenscape', url: (tmdbId, type) => `https://screenscape.me/embed?tmdb=${tmdbId}&type=${type}`, priority: 8 },
  { name: 'vidplays', url: (tmdbId, type) => `https://vidplays.fun/embed/${type}/${tmdbId}`, priority: 9 },

  // Tier 3: Good Alternatives
  { name: 'VidFast', url: (tmdbId, type) => `https://vidfast.pro/${type}/${tmdbId}`, priority: 10 },
  { name: 'VidPhantom', url: (tmdbId, type) => `https://vidphantom.com/${type}/${tmdbId}`, priority: 11 },
  { name: 'VidKing', url: (tmdbId, type) => `https://www.vidking.net/embed/${type}/${tmdbId}?autoPlay=true`, priority: 12 },
  { name: 'VidNest', url: (tmdbId, type) => `https://vidnest.fun/${type}/${tmdbId}`, priority: 13 },
  { name: 'modocine', url: (tmdbId, type) => `https://play.modocine.com/play.php/embed/${type}/${tmdbId}`, priority: 14 },
  { name: 'VidRift', url: (tmdbId, type) => `https://vidrift.in/embed/${type}/${tmdbId}`, priority: 15 },

  // Tier 4: Extras
  { name: 'VidLove', url: (tmdbId, type) => `https://player.vidlove.cc/embed/${type}/${tmdbId}`, priority: 16 },
  { name: '2embed', url: (tmdbId, type) => `https://www.2embed.stream/embed/${type}/${tmdbId}`, priority: 17 },
  { name: 'Frembed', url: (tmdbId, type) => type === 'tv' ? `https://frembed.hair/api/serie.php?id=${tmdbId}&sa=1&epi=1` : `https://frembed.hair/embed/movie/${tmdbId}`, priority: 18 },

  // Scraper-based (local, no iframe)
  { name: 'Cinemana', url: () => 'https://cinemana.cc', priority: 19, needsResolution: true },
  { name: 'HD1', url: () => 'https://hd1.brstej.com', priority: 20, needsResolution: true },
  { name: 'Anime3rb', url: () => 'https://anime3rb.com', priority: 21, needsResolution: true },
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
  return PROVIDERS.map(p => {
    const branded = BRANDED[p.name];
    return {
      name: p.name,
      displayName: branded?.displayName || p.name,
      brandColor: branded?.color,
      url: addArabicSubs(p.url(tmdbId, mediaType)),
      priority: p.priority,
      needsResolution: p.needsResolution,
    };
  });
}
