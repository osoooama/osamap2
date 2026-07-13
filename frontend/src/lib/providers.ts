export interface Provider {
  name: string;
  displayName?: string;
  brandColor?: string;
  url: (tmdbId: string, type: string, season?: number, episode?: number) => string;
  priority: number;
  needsResolution?: boolean;
  isAnime?: boolean;
}

export const BRANDED: Record<string, { displayName: string; color: string; glow: string }> = {
  vidlink: { displayName: 'OSK+', color: '#ffd700', glow: '#ffd700' },
  apiplayer: { displayName: 'OSK+ Pro', color: '#ff3333', glow: '#ff0000' },
  VidLove: { displayName: 'OSK+ Gold', color: '#ffd700', glow: '#ffaa00' },
  MegaPlay: { displayName: 'OSK+ Anime', color: '#a855f7', glow: '#a855f7' },
};

const PROVIDERS: Provider[] = [
  // Tier 1: Verified Working (HTTP 200, real content)
  { name: 'VidSrc', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}` : `https://vidsrc.xyz/embed/${type}/${tmdbId}`, priority: 1 },
  { name: 'StreameX', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://play.xpass.top/e/tv/${tmdbId}/${season}/${episode}` : `https://play.xpass.top/e/${type}/${tmdbId}`, priority: 2 },
  { name: 'vidlink', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}` : `https://vidlink.pro/${type}/${tmdbId}`, priority: 3 },
  { name: 'apiplayer', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://apiplayer.ru/embed/tv/${tmdbId}/${season}/${episode}` : `https://apiplayer.ru/embed/${type}/${tmdbId}`, priority: 4 },
  { name: 'screenscape', url: (tmdbId, type, season, episode) => `https://screenscape.me/embed?tmdb=${tmdbId}&type=${type}${season ? `&season=${season}` : ''}${episode ? `&episode=${episode}` : ''}`, priority: 5 },

  // Tier 2: Working (HTTP 200)
  { name: 'VidCore', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://www.vidcore.org/embed/tv/${tmdbId}/${season}/${episode}` : `https://www.vidcore.org/embed/${type}/${tmdbId}`, priority: 6 },
  { name: 'vidplays', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidplays.fun/embed/tv/${tmdbId}/${season}/${episode}` : `https://vidplays.fun/embed/${type}/${tmdbId}`, priority: 7 },
  { name: '2embed', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://www.2embed.stream/embed/tv/${tmdbId}/${season}/${episode}` : `https://www.2embed.stream/embed/${type}/${tmdbId}`, priority: 8 },
  { name: 'Frembed', url: (tmdbId, type, season, episode) => type === 'tv' ? `https://frembed.hair/api/serie.php?id=${tmdbId}&sa=${season || 1}&epi=${episode || 1}` : `https://frembed.hair/embed/movie/${tmdbId}`, priority: 9 },

  // Tier 3: Working but may have issues
  { name: 'VidFast', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}` : `https://vidfast.pro/${type}/${tmdbId}`, priority: 10 },
  { name: 'VidPhantom', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidphantom.com/tv/${tmdbId}/${season}/${episode}` : `https://vidphantom.com/${type}/${tmdbId}`, priority: 11 },
  { name: 'VidKing', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=true` : `https://www.vidking.net/embed/${type}/${tmdbId}?autoPlay=true`, priority: 12 },
  { name: 'VidNest', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidnest.fun/tv/${tmdbId}/${season}/${episode}` : `https://vidnest.fun/${type}/${tmdbId}`, priority: 13 },
  { name: 'VidRift', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidrift.in/embed/tv/${tmdbId}/${season}/${episode}` : `https://vidrift.in/embed/${type}/${tmdbId}`, priority: 14 },
  { name: 'VidLove', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://player.vidlove.cc/embed/tv/${tmdbId}/${season}/${episode}` : `https://player.vidlove.cc/embed/${type}/${tmdbId}`, priority: 15 },

  // Anime-specific providers
  { name: 'MegaPlay', url: (tmdbId) => `https://megaplay.buzz/stream/ani/${tmdbId}/1/sub`, priority: 16, isAnime: true },

  // Scraper-based (local, no iframe)
  { name: 'Cinemana', url: () => 'https://cinemana.cc', priority: 17, needsResolution: true },
  { name: 'HD1', url: () => 'https://hd1.brstej.com', priority: 18, needsResolution: true },
  { name: 'Anime3rb', url: () => 'https://anime3rb.com', priority: 19, needsResolution: true },
];

export function getProviders(tmdbId: string, mediaType = 'movie', season?: number, episode?: number) {
  return PROVIDERS.map(p => {
    const branded = BRANDED[p.name];
    return {
      name: p.name,
      displayName: branded?.displayName || p.name,
      brandColor: branded?.color,
      url: p.url(tmdbId, mediaType, season, episode),
      priority: p.priority,
      needsResolution: p.needsResolution,
      isAnime: p.isAnime,
    };
  });
}

export function getAnimeProviders(anilistId: string | number, episode = 1, language: 'sub' | 'dub' = 'sub') {
  const providers: { name: string; displayName: string; brandColor?: string; url: string; priority: number }[] = [
    {
      name: 'VidLink-Anime',
      displayName: 'OSK+ Anime',
      brandColor: '#ffd700',
      url: `https://vidlink.pro/anime/${anilistId}/${episode}/${language}`,
      priority: 1,
    },
    {
      name: 'MegaPlay',
      displayName: 'OSK+ Anime 2',
      brandColor: '#a855f7',
      url: `https://megaplay.buzz/stream/ani/${anilistId}/${episode}/${language}`,
      priority: 2,
    },
  ];
  return providers;
}
