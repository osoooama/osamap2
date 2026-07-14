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
  screenscape: { displayName: 'OSK+ Max', color: '#3b82f6', glow: '#3b82f6' },
  VidLove: { displayName: 'OSK+ Gold', color: '#ffd700', glow: '#ffaa00' },
  VidFast: { displayName: 'OSK+ Fast', color: '#10b981', glow: '#10b981' },
};

const PROVIDERS: Provider[] = [
  // Tier 1: Verified Working (tested in Brave browser, player loads)
  { name: 'vidlink', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}` : `https://vidlink.pro/${type}/${tmdbId}`, priority: 1 },
  { name: 'screenscape', url: (tmdbId, type, season, episode) => `https://screenscape.me/embed?tmdb=${tmdbId}&type=${type}${season ? `&season=${season}` : ''}${episode ? `&episode=${episode}` : ''}`, priority: 2 },

  // Tier 2: HTTP 200, player loads (may have minor issues)
  { name: 'VidLove', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://player.vidlove.cc/embed/tv/${tmdbId}/${season}/${episode}` : `https://player.vidlove.cc/embed/${type}/${tmdbId}`, priority: 3 },
  { name: 'VidFast', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidfast.vc/tv/${tmdbId}/${season}/${episode}?autoPlay=true` : `https://vidfast.vc/${type}/${tmdbId}?autoPlay=true`, priority: 4 },

  // Tier 3: HTTP 200 but untested players
  { name: 'VidCore', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://www.vidcore.org/embed/tv/${tmdbId}/${season}/${episode}` : `https://www.vidcore.org/embed/${type}/${tmdbId}`, priority: 5 },
  { name: 'vidplays', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidplays.fun/embed/tv/${tmdbId}/${season}/${episode}` : `https://vidplays.fun/embed/${type}/${tmdbId}`, priority: 6 },
  { name: 'Frembed', url: (tmdbId, type, season, episode) => type === 'tv' ? `https://frembed.hair/api/serie.php?id=${tmdbId}&sa=${season || 1}&epi=${episode || 1}` : `https://frembed.hair/embed/movie/${tmdbId}`, priority: 7 },
  { name: 'VidPhantom', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidphantom.com/tv/${tmdbId}/${season}/${episode}` : `https://vidphantom.com/${type}/${tmdbId}`, priority: 8 },
  { name: 'VidKing', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=true` : `https://www.vidking.net/embed/${type}/${tmdbId}?autoPlay=true`, priority: 9 },
  { name: 'VidNest', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidnest.fun/tv/${tmdbId}/${season}/${episode}` : `https://vidnest.fun/${type}/${tmdbId}`, priority: 10 },
  { name: 'VidRift', url: (tmdbId, type, season, episode) => type === 'tv' && season && episode ? `https://vidrift.in/embed/tv/${tmdbId}/${season}/${episode}` : `https://vidrift.in/embed/${type}/${tmdbId}`, priority: 11 },

  // Scraper-based (local, no iframe — requires backend scraper to resolve IDs)
  { name: 'Cinemana', url: () => 'https://cinemana.cc', priority: 12, needsResolution: true },
  { name: 'HD1', url: () => 'https://hd1.brstej.com', priority: 13, needsResolution: true },
  { name: 'Anime3rb', url: () => 'https://anime3rb.com', priority: 14, needsResolution: true },
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
