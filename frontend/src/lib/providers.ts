export interface Provider {
  name: string;
  displayName?: string;
  brandColor?: string;
  url: (tmdbId: string, type: string, season?: number, episode?: number) => string;
  priority: number;
  needsResolution?: boolean;
  isAnime?: boolean;
  category: 'foreign' | 'anime' | 'arabic' | 'all';
}

export interface AnimeProvider {
  name: string;
  displayName: string;
  brandColor?: string;
  url: (anilistId: string | number, episode: number, language: 'sub' | 'dub') => string;
  priority: number;
}

export type ProviderTier = 'verified' | 'stable' | 'extras' | 'scrapers';

export const BRANDED: Record<string, { displayName: string; color: string; glow: string }> = {
  vidlink: { displayName: 'OSK+', color: '#ffd700', glow: '#ffd700' },
  screenscape: { displayName: 'OSK+ Max', color: '#3b82f6', glow: '#3b82f6' },
  VidLove: { displayName: 'OSK+ Gold', color: '#ffd700', glow: '#ffaa00' },
  VidFast: { displayName: 'OSK+ Fast', color: '#10b981', glow: '#10b981' },
  VidPlus: { displayName: 'OSK+ Plus', color: '#a855f7', glow: '#a855f7' },
  SmashyStream: { displayName: 'OSK+ Smash', color: '#f97316', glow: '#f97316' },
  EmbedSu: { displayName: 'OSK+ Embed', color: '#06b6d4', glow: '#06b6d4' },
  MoviesAPI: { displayName: 'OSK+ Movies', color: '#ec4899', glow: '#ec4899' },
  AutoEmbed: { displayName: 'OSK+ Auto', color: '#8b5cf6', glow: '#8b5cf6' },
  MultiEmbed: { displayName: 'OSK+ Multi', color: '#14b8a6', glow: '#14b8a6' },
  PStream: { displayName: 'OSK+ Stream', color: '#f43f5e', glow: '#f43f5e' },
  Frembed: { displayName: 'OSK+ FR', color: '#0ea5e9', glow: '#0ea5e9' },
  VidSrcTo: { displayName: 'OSK+ Src', color: '#d946ef', glow: '#d946ef' },
  VidSrcCC: { displayName: 'OSK+ CC', color: '#f59e0b', glow: '#f59e0b' },
  VidSrcPM: { displayName: 'OSK+ PM', color: '#10b981', glow: '#10b981' },
  VidSrcMe: { displayName: 'OSK+ Me', color: '#3b82f6', glow: '#3b82f6' },
  VidSrcIcu: { displayName: 'OSK+ ICU', color: '#ef4444', glow: '#ef4444' },
  VidSrcFyi: { displayName: 'OSK+ FYI', color: '#8b5cf6', glow: '#8b5cf6' },
};

const TMDB_PROVIDERS: Provider[] = [
  // ═══════════════════════════════════════════════════════════════
  // TIER 1: VERIFIED WORKING (الأفضل والأكثر استقراراً)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'vidlink',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
        : `https://vidlink.pro/movie/${tmdbId}`,
    priority: 1,
    category: 'all',
  },
  {
    name: 'VidFast',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}?autoPlay=true`
        : `https://vidfast.pro/movie/${tmdbId}?autoPlay=true`,
    priority: 2,
    category: 'all',
  },
  {
    name: 'screenscape',
    url: (tmdbId, type, season, episode) =>
      `https://screenscape.me/embed?tmdb=${tmdbId}&type=${type}${season ? `&season=${season}` : ''}${episode ? `&episode=${episode}` : ''}`,
    priority: 3,
    category: 'all',
  },
  {
    name: 'VidLove',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://player.vidlove.cc/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://player.vidlove.cc/embed/movie/${tmdbId}`,
    priority: 4,
    category: 'all',
  },
  {
    name: 'EmbedSu',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://embed.su/embed/movie/${tmdbId}`,
    priority: 5,
    category: 'all',
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: STABLE PROVIDERS (مستقرة ومُختبرة)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'VidSrcTo',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${tmdbId}`,
    priority: 6,
    category: 'all',
  },
  {
    name: 'VidSrcCC',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
    priority: 7,
    category: 'all',
  },
  {
    name: 'VidSrcPM',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.pm/embed/movie/${tmdbId}`,
    priority: 8,
    category: 'all',
  },
  {
    name: 'VidSrcMe',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
        : `https://vidsrc-embed.ru/embed/movie?tmdb=${tmdbId}`,
    priority: 9,
    category: 'all',
  },
  {
    name: 'VidSrcIcu',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.icu/embed/movie/${tmdbId}`,
    priority: 10,
    category: 'all',
  },
  {
    name: 'VidSrcFyi',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.fyi/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.fyi/embed/movie/${tmdbId}`,
    priority: 11,
    category: 'all',
  },
  {
    name: 'SmashyStream',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    priority: 12,
    category: 'all',
  },
  {
    name: 'MoviesAPI',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://moviesapi.to/tv/${tmdbId}-${season}-${episode}`
        : `https://moviesapi.to/movie/${tmdbId}`,
    priority: 13,
    category: 'all',
  },
  {
    name: 'AutoEmbed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`
        : `https://autoembed.co/movie/tmdb/${tmdbId}`,
    priority: 14,
    category: 'all',
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: EXTRAS (إضافيون)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'VidKing',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=true`
        : `https://www.vidking.net/embed/movie/${tmdbId}?autoPlay=true`,
    priority: 15,
    category: 'all',
  },
  {
    name: 'VidCore',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://www.vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://www.vidcore.org/embed/movie/${tmdbId}`,
    priority: 16,
    category: 'all',
  },
  {
    name: 'vidplays',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidplays.fun/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidplays.fun/embed/movie/${tmdbId}`,
    priority: 17,
    category: 'all',
  },
  {
    name: 'Frembed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv'
        ? `https://frembed.cc/api/serie.php?id=${tmdbId}&sa=${season || 1}&epi=${episode || 1}`
        : `https://frembed.cc/api/film.php?id=${tmdbId}`,
    priority: 18,
    category: 'all',
  },
  {
    name: 'VidPhantom',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidphantom.com/tv/${tmdbId}/${season}/${episode}`
        : `https://vidphantom.com/movie/${tmdbId}`,
    priority: 19,
    category: 'all',
  },
  {
    name: 'VidNest',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidnest.fun/tv/${tmdbId}/${season}/${episode}`
        : `https://vidnest.fun/movie/${tmdbId}`,
    priority: 20,
    category: 'all',
  },
  {
    name: 'VidRift',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidrift.in/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidrift.in/embed/movie/${tmdbId}`,
    priority: 21,
    category: 'all',
  },
  {
    name: 'MultiEmbed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    priority: 22,
    category: 'all',
  },
  {
    name: 'PStream',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://iframe.pstream.org/embed/tmdb-tv-${tmdbId}/${season}/${episode}`
        : `https://iframe.pstream.org/embed/tmdb-movie-${tmdbId}`,
    priority: 23,
    category: 'all',
  },
  {
    name: 'VidPlus',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://player.vidplus.pro/embed/tv/${tmdbId}/${season}/${episode}?autoplay=true`
        : `https://player.vidplus.pro/embed/movie/${tmdbId}?autoplay=true`,
    priority: 24,
    category: 'all',
  },
  {
    name: 'VidRock',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidrock.net/tv/${tmdbId}/${season}/${episode}?autoplay=true`
        : `https://vidrock.net/movie/${tmdbId}?autoplay=true`,
    priority: 25,
    category: 'all',
  },
  {
    name: 'VidSync',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsync.xyz/embed/tv/${tmdbId}/${season}/${episode}?autoPlay=true`
        : `https://vidsync.xyz/embed/movie/${tmdbId}?autoPlay=true`,
    priority: 26,
    category: 'all',
  },
  {
    name: 'VidZee',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://player.vidzee.wtf/tv/${tmdbId}/${season}/${episode}`
        : `https://player.vidzee.wtf/movie/${tmdbId}`,
    priority: 27,
    category: 'all',
  },
  {
    name: 'MegaEmbed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://mgeb.top/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://mgeb.top/embed/movie/${tmdbId}`,
    priority: 28,
    category: 'all',
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 4: VIDSRC FAMILY (نسخ إضافية)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'VidSrcRip',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.rip/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.rip/embed/movie/${tmdbId}`,
    priority: 29,
    category: 'all',
  },
  {
    name: 'VidSrcSu',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.su/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.su/embed/movie/${tmdbId}`,
    priority: 30,
    category: 'all',
  },
  {
    name: 'VidSrcVip',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.vip/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.vip/embed/movie/${tmdbId}`,
    priority: 31,
    category: 'all',
  },
  {
    name: 'VidSrcXyz',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.xyz/embed/movie/${tmdbId}`,
    priority: 32,
    category: 'all',
  },
  {
    name: 'VidSrcNet',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.net/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
        : `https://vidsrc.net/embed/movie?tmdb=${tmdbId}`,
    priority: 33,
    category: 'all',
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 5: SCRAPER-BASED (سكراopers)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'HD1',
    url: () => 'https://hd1.brstej.com',
    priority: 50,
    needsResolution: true,
    category: 'arabic',
  },
  {
    name: 'AniSlayer',
    url: () => 'https://animeslayer.to',
    priority: 51,
    needsResolution: true,
    isAnime: true,
    category: 'anime',
  },
];

const ANIME_PROVIDERS: AnimeProvider[] = [
  {
    name: 'VidLink-Anime',
    displayName: 'OSK+ Anime',
    brandColor: '#ffd700',
    url: (anilistId, episode, language) =>
      `https://vidlink.pro/anime/${anilistId}/${episode}/${language}`,
    priority: 1,
  },
  {
    name: 'VidPlus-Anime',
    displayName: 'OSK+ Anime Plus',
    brandColor: '#a855f7',
    url: (anilistId, episode, language) =>
      `https://player.vidplus.to/embed/anime/${anilistId}/${episode}?dub=${language === 'dub'}`,
    priority: 2,
  },
  {
    name: 'MegaPlay',
    displayName: 'OSK+ Anime 2',
    brandColor: '#a855f7',
    url: (anilistId, episode, language) =>
      `https://megaplay.buzz/stream/ani/${anilistId}/${episode}/${language}`,
    priority: 3,
  },
];

export function getProviders(tmdbId: string, mediaType = 'movie', season?: number, episode?: number) {
  return TMDB_PROVIDERS.map(p => {
    const branded = BRANDED[p.name];
    return {
      name: p.name,
      displayName: branded?.displayName || p.name,
      brandColor: branded?.color,
      url: p.url(tmdbId, mediaType, season, episode),
      priority: p.priority,
      needsResolution: p.needsResolution,
      isAnime: p.isAnime,
      category: p.category,
    };
  });
}

export function getAnimeProviders(anilistId: string | number, episode = 1, language: 'sub' | 'dub' = 'sub') {
  return ANIME_PROVIDERS.map(p => ({
    name: p.name,
    displayName: p.displayName,
    brandColor: p.brandColor,
    url: p.url(anilistId, episode, language),
    priority: p.priority,
  }));
}

export function getProviderCount() {
  return {
    total: TMDB_PROVIDERS.length + ANIME_PROVIDERS.length,
    iframe: TMDB_PROVIDERS.filter(p => !p.needsResolution).length + ANIME_PROVIDERS.length,
    scrapers: TMDB_PROVIDERS.filter(p => p.needsResolution).length,
  };
}
