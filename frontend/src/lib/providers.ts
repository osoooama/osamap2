export interface Provider {
  name: string;
  displayName?: string;
  brandColor?: string;
  url: (tmdbId: string, type: string, season?: number, episode?: number) => string;
  priority: number;
  needsResolution?: boolean;
  isAnime?: boolean;
  category: 'foreign' | 'anime' | 'arabic' | 'turkish' | 'all';
}

export interface AnimeProvider {
  name: string;
  displayName: string;
  brandColor?: string;
  url: (anilistId: string | number, episode: number, language: 'sub' | 'dub') => string;
  priority: number;
}

export const BRANDED: Record<string, { displayName: string; color: string; glow: string }> = {
  vidlink: { displayName: 'OSK+', color: '#ffd700', glow: '#ffd700' },
  screenscape: { displayName: 'OSK+ Max', color: '#3b82f6', glow: '#3b82f6' },
  VidLove: { displayName: 'OSK+ Gold', color: '#ffd700', glow: '#ffaa00' },
  VidFast: { displayName: 'OSK+ Fast', color: '#10b981', glow: '#10b981' },
  VidSrcTo: { displayName: 'OSK+ Src', color: '#d946ef', glow: '#d946ef' },
  VidSrcCC: { displayName: 'OSK+ CC', color: '#f59e0b', glow: '#f59e0b' },
  EmbedSu: { displayName: 'OSK+ Embed', color: '#06b6d4', glow: '#06b6d4' },
  SmashyStream: { displayName: 'OSK+ Smash', color: '#f97316', glow: '#f97316' },
  MoviesAPI: { displayName: 'OSK+ Movies', color: '#ec4899', glow: '#ec4899' },
  AutoEmbed: { displayName: 'OSK+ Auto', color: '#8b5cf6', glow: '#8b5cf6' },
  MultiEmbed: { displayName: 'OSK+ Multi', color: '#14b8a6', glow: '#14b8a6' },
  PStream: { displayName: 'OSK+ Stream', color: '#f43f5e', glow: '#f43f5e' },
  Frembed: { displayName: 'OSK+ FR', color: '#0ea5e9', glow: '#0ea5e9' },
  VidSrcPM: { displayName: 'OSK+ PM', color: '#10b981', glow: '#10b981' },
  VidSrcIcu: { displayName: 'OSK+ ICU', color: '#ef4444', glow: '#ef4444' },
  VidSrcFyi: { displayName: 'OSK+ FYI', color: '#8b5cf6', glow: '#8b5cf6' },
  VidSrcRip: { displayName: 'OSK+ Rip', color: '#f97316', glow: '#f97316' },
  VidSrcSu: { displayName: 'OSK+ Su', color: '#06b6d4', glow: '#06b6d4' },
  HD1: { displayName: 'OSK+ HD1', color: '#10b981', glow: '#10b981' },
  FaselHD: { displayName: 'OSK+ FaselHD', color: '#00ca97', glow: '#00ca97' },
  MyCima: { displayName: 'OSK+ MyCima', color: '#3b82f6', glow: '#3b82f6' },
  ArabSeed: { displayName: 'OSK+ ArabSeed', color: '#f97316', glow: '#f97316' },
  Cinemana: { displayName: 'OSK+ Cinemana', color: '#a855f7', glow: '#a855f7' },
  EgyBest: { displayName: 'OSK+ EgyBest', color: '#ef4444', glow: '#ef4444' },
  CimaNow: { displayName: 'OSK+ CimaNow', color: '#06b6d4', glow: '#06b6d4' },
  Fushaar: { displayName: 'OSK+ Fushaar', color: '#f59e0b', glow: '#f59e0b' },
  Movizland: { displayName: 'OSK+ Movizland', color: '#8b5cf6', glow: '#8b5cf6' },
  Shahid4u: { displayName: 'OSK+ Shahid4u', color: '#00ca97', glow: '#00ca97' },
  DiziPal: { displayName: 'OSK+ DiziPal', color: '#f59e0b', glow: '#f59e0b' },
  SezonlukDizi: { displayName: 'OSK+ Sezonluk', color: '#ef4444', glow: '#ef4444' },
  VidLinkAnime: { displayName: 'OSK+ Anime', color: '#ffd700', glow: '#ffd700' },
  VidPlusAnime: { displayName: 'OSK+ Anime Plus', color: '#a855f7', glow: '#a855f7' },
  MegaPlay: { displayName: 'OSK+ Anime 2', color: '#a855f7', glow: '#a855f7' },
};

// ═══════════════════════════════════════════════════════════════
// Netflix (أجنبية) - سيرفرات عالمية TMDB
// ═══════════════════════════════════════════════════════════════
const NETFLIX_PROVIDERS: Provider[] = [
  {
    name: 'vidlink',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
        : `https://vidlink.pro/movie/${tmdbId}`,
    priority: 1,
    category: 'foreign',
  },
  {
    name: 'VidFast',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}?autoPlay=true`
        : `https://vidfast.pro/movie/${tmdbId}?autoPlay=true`,
    priority: 2,
    category: 'foreign',
  },
  {
    name: 'screenscape',
    url: (tmdbId, type, season, episode) =>
      `https://screenscape.me/embed?tmdb=${tmdbId}&type=${type}${season ? `&season=${season}` : ''}${episode ? `&episode=${episode}` : ''}`,
    priority: 3,
    category: 'foreign',
  },
  {
    name: 'VidLove',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://player.vidlove.cc/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://player.vidlove.cc/embed/movie/${tmdbId}`,
    priority: 4,
    category: 'foreign',
  },
  {
    name: 'EmbedSu',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://embed.su/embed/movie/${tmdbId}`,
    priority: 5,
    category: 'foreign',
  },
  {
    name: 'VidSrcTo',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${tmdbId}`,
    priority: 6,
    category: 'foreign',
  },
  {
    name: 'VidSrcCC',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
    priority: 7,
    category: 'foreign',
  },
  {
    name: 'SmashyStream',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    priority: 8,
    category: 'foreign',
  },
  {
    name: 'MoviesAPI',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://moviesapi.to/tv/${tmdbId}-${season}-${episode}`
        : `https://moviesapi.to/movie/${tmdbId}`,
    priority: 9,
    category: 'foreign',
  },
  {
    name: 'AutoEmbed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`
        : `https://autoembed.co/movie/tmdb/${tmdbId}`,
    priority: 10,
    category: 'foreign',
  },
  {
    name: 'Frembed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv'
        ? `https://frembed.cc/api/serie.php?id=${tmdbId}&sa=${season || 1}&epi=${episode || 1}`
        : `https://frembed.cc/api/film.php?id=${tmdbId}`,
    priority: 11,
    category: 'foreign',
  },
  {
    name: 'MultiEmbed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    priority: 12,
    category: 'foreign',
  },
  {
    name: 'PStream',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://iframe.pstream.org/embed/tmdb-tv-${tmdbId}/${season}/${episode}`
        : `https://iframe.pstream.org/embed/tmdb-movie-${tmdbId}`,
    priority: 13,
    category: 'foreign',
  },
  {
    name: 'VidSrcPM',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.pm/embed/movie/${tmdbId}`,
    priority: 14,
    category: 'foreign',
  },
  {
    name: 'VidSrcIcu',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.icu/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.icu/embed/movie/${tmdbId}`,
    priority: 15,
    category: 'foreign',
  },
  {
    name: 'VidSrcFyi',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.fyi/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.fyi/embed/movie/${tmdbId}`,
    priority: 16,
    category: 'foreign',
  },
  {
    name: 'VidSrcRip',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.rip/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.rip/embed/movie/${tmdbId}`,
    priority: 17,
    category: 'foreign',
  },
  {
    name: 'VidSrcSu',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://vidsrc.su/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.su/embed/movie/${tmdbId}`,
    priority: 18,
    category: 'foreign',
  },
];

// ═══════════════════════════════════════════════════════════════
// Shahid (عربية + تركية) - سيرفرات عربية وتركية
// ═══════════════════════════════════════════════════════════════
const SHAHID_PROVIDERS: Provider[] = [
  // سيرفرات عربية (أفضل)
  {
    name: 'HD1',
    url: () => 'https://hd1.brstej.com',
    priority: 1,
    needsResolution: true,
    category: 'arabic',
  },
  {
    name: 'FaselHD',
    url: () => 'https://fasselhd.com',
    priority: 2,
    needsResolution: true,
    category: 'arabic',
  },
  {
    name: 'MyCima',
    url: () => 'https://mycima.video',
    priority: 3,
    needsResolution: true,
    category: 'arabic',
  },
  {
    name: 'ArabSeed',
    url: () => 'https://arabseed.cam',
    priority: 4,
    needsResolution: true,
    category: 'arabic',
  },
  {
    name: 'Cinemana',
    url: () => 'https://cinemana.cc',
    priority: 5,
    needsResolution: true,
    category: 'arabic',
  },
  {
    name: 'EgyBest',
    url: () => 'https://egybest.org',
    priority: 6,
    needsResolution: true,
    category: 'arabic',
  },
  {
    name: 'CimaNow',
    url: () => 'https://cimanow.cc',
    priority: 7,
    needsResolution: true,
    category: 'arabic',
  },
  {
    name: 'Fushaar',
    url: () => 'https://fushaar.com',
    priority: 8,
    needsResolution: true,
    category: 'arabic',
  },
  {
    name: 'Movizland',
    url: () => 'https://movizland.info',
    priority: 9,
    needsResolution: true,
    category: 'arabic',
  },
  {
    name: 'Shahid4u',
    url: () => 'https://shahid4u.site',
    priority: 10,
    needsResolution: true,
    category: 'arabic',
  },
  // سيرفرات تركية
  {
    name: 'DiziPal',
    url: () => 'https://dizipal.com',
    priority: 11,
    needsResolution: true,
    category: 'turkish',
  },
  {
    name: 'SezonlukDizi',
    url: () => 'https://sezonlukdizi.com',
    priority: 12,
    needsResolution: true,
    category: 'turkish',
  },
  // سيرفرات احتياطية عالمية
  {
    name: 'Frembed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv'
        ? `https://frembed.cc/api/serie.php?id=${tmdbId}&sa=${season || 1}&epi=${episode || 1}`
        : `https://frembed.cc/api/film.php?id=${tmdbId}`,
    priority: 13,
    category: 'arabic',
  },
  {
    name: 'MultiEmbed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    priority: 14,
    category: 'all',
  },
];

// ═══════════════════════════════════════════════════════════════
// Disney+ (أنيميشن) - سيرفرات عالمية
// ═══════════════════════════════════════════════════════════════
const DISNEY_PROVIDERS: Provider[] = [
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
    name: 'SmashyStream',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    priority: 7,
    category: 'all',
  },
  {
    name: 'AutoEmbed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`
        : `https://autoembed.co/movie/tmdb/${tmdbId}`,
    priority: 8,
    category: 'all',
  },
  {
    name: 'Frembed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv'
        ? `https://frembed.cc/api/serie.php?id=${tmdbId}&sa=${season || 1}&epi=${episode || 1}`
        : `https://frembed.cc/api/film.php?id=${tmdbId}`,
    priority: 9,
    category: 'all',
  },
  {
    name: 'MultiEmbed',
    url: (tmdbId, type, season, episode) =>
      type === 'tv' && season && episode
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    priority: 10,
    category: 'all',
  },
];

// ═══════════════════════════════════════════════════════════════
// Crunchyroll (أنمي) - سيرفرات أنمي
// ═══════════════════════════════════════════════════════════════
const ANIME_PROVIDERS: AnimeProvider[] = [
  {
    name: 'VidLinkAnime',
    displayName: 'OSK+ Anime',
    brandColor: '#ffd700',
    url: (anilistId, episode, language) =>
      `https://vidlink.pro/anime/${anilistId}/${episode}/${language}`,
    priority: 1,
  },
  {
    name: 'VidPlusAnime',
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

export function getProviders(tmdbId: string, mediaType = 'movie', season?: number, episode?: number, platform?: string) {
  let sourceProviders: Provider[];

  switch (platform) {
    case 'shahid':
      sourceProviders = SHAHID_PROVIDERS;
      break;
    case 'disney':
      sourceProviders = DISNEY_PROVIDERS;
      break;
    case 'netflix':
    default:
      sourceProviders = NETFLIX_PROVIDERS;
      break;
  }

  return sourceProviders.map(p => {
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
    netflix: NETFLIX_PROVIDERS.length,
    shahid: SHAHID_PROVIDERS.length,
    disney: DISNEY_PROVIDERS.length,
    crunchyroll: ANIME_PROVIDERS.length,
    total: NETFLIX_PROVIDERS.length + SHAHID_PROVIDERS.length + DISNEY_PROVIDERS.length + ANIME_PROVIDERS.length,
  };
}
