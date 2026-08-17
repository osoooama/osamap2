export interface Provider {
  name: string;
  displayName: string;
  description: string;
  brandColor: string;
  url: (tmdbId: string, type: string, season?: number, episode?: number) => string;
  priority: number;
  needsResolution?: boolean;
  category: 'foreign' | 'anime' | 'arabic' | 'turkish' | 'animation' | 'all';
}

export interface AnimeProvider {
  name: string;
  displayName: string;
  description: string;
  brandColor: string;
  url: (anilistId: string | number, episode: number, language: 'sub' | 'dub') => string;
  priority: number;
}

const FOREIGN_PROVIDERS: Provider[] = [
  { name: 'vidlink', displayName: 'VidLink Pro', description: 'أجود جودة، تشغيل تلقائي', brandColor: '#ffd700', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidlink.pro/tv/${t}/${s}/${e}` : `https://vidlink.pro/movie/${t}`, priority: 1, category: 'foreign' },
  { name: 'VidFast', displayName: 'VidFast', description: 'سريع التحميل، جودة عالية', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidfast.pro/tv/${t}/${s}/${e}?autoPlay=true` : `https://vidfast.pro/movie/${t}?autoPlay=true`, priority: 2, category: 'foreign' },
  { name: 'screenscape', displayName: 'Screenscape', description: 'مصادر متعددة، HDR', brandColor: '#3b82f6', url: (t, tp, s, e) => `https://screenscape.me/embed?tmdb=${t}&type=${tp}${s ? `&season=${s}` : ''}${e ? `&episode=${e}` : ''}`, priority: 3, category: 'foreign' },
  { name: 'VidLove', displayName: 'VidLove', description: 'مصدر موثوق، إعلانات قليلة', brandColor: '#f59e0b', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.vidlove.cc/embed/tv/${t}/${s}/${e}` : `https://player.vidlove.cc/embed/movie/${t}`, priority: 4, category: 'foreign' },
  { name: 'EmbedSu', displayName: 'Embed.su', description: 'سريع ومستقر', brandColor: '#06b6d4', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.su/embed/tv/${t}/${s}/${e}` : `https://embed.su/embed/movie/${t}`, priority: 5, category: 'foreign' },
  { name: 'AutoEmbed', displayName: 'AutoEmbed', description: 'كشف تلقائي لأفضل مصدر', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.autoembed.app/embed/tv/${t}/${s}/${e}` : `https://player.autoembed.app/embed/movie/${t}`, priority: 6, category: 'foreign' },
  { name: 'VidSrcTo', displayName: 'VidSrc', description: 'مصدر أساسي، موثوق', brandColor: '#d946ef', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.to/embed/tv/${t}/${s}/${e}` : `https://vidsrc.to/embed/movie/${t}`, priority: 7, category: 'foreign' },
  { name: 'SmashyStream', displayName: 'SmashyStream', description: 'جودات متعددة، سريع', brandColor: '#f97316', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.smashystream.com/playere.php?tmdb=${t}&season=${s}&episode=${e}` : `https://embed.smashystream.com/playere.php?tmdb=${t}`, priority: 8, category: 'foreign' },
];

const ARABIC_PROVIDERS: Provider[] = [
  { name: 'Cinemana', displayName: 'سينمانا', description: 'زاحف عربي — يبحث بالاسم', brandColor: '#d946ef', url: (t) => `/api/streams/${t}?category=arabic`, priority: 1, category: 'arabic', needsResolution: true },
  { name: 'FaselHD', displayName: 'فاصل HD', description: 'زاحف عربي — يبحث بالاسم', brandColor: '#10b981', url: (t) => `/api/streams/${t}?category=arabic`, priority: 2, category: 'arabic', needsResolution: true },
  { name: 'MyCima', displayName: 'ماي سيما', description: 'زاحف عربي — يبحث بالاسم', brandColor: '#3b82f6', url: (t) => `/api/streams/${t}?category=arabic`, priority: 3, category: 'arabic', needsResolution: true },
  { name: 'CimaClub', displayName: 'سيما كلوب', description: 'زاحف عربي — يبحث بالاسم', brandColor: '#f59e0b', url: (t) => `/api/streams/${t}?category=arabic`, priority: 4, category: 'arabic', needsResolution: true },
  { name: 'ArabSeed', displayName: 'عرب سيد', description: 'زاحف عربي — يبحث بالاسم', brandColor: '#ef4444', url: (t) => `/api/streams/${t}?category=arabic`, priority: 5, category: 'arabic', needsResolution: true },
  { name: 'Hd1', displayName: 'HD1 براستيج', description: 'زاحف عربي — يبحث بالاسم', brandColor: '#8b5cf6', url: (t) => `/api/streams/${t}?category=arabic`, priority: 6, category: 'arabic', needsResolution: true },
];

const TURKISH_PROVIDERS: Provider[] = [
  { name: 'Qissat', displayName: 'قصة عشق', description: 'زاحف تركي — يبحث بالاسم', brandColor: '#dc2626', url: (t) => `/api/streams/${t}?category=turkish`, priority: 1, category: 'turkish', needsResolution: true },
  { name: 'HDFilmCehennemi', displayName: 'HD فيلم جهنم', description: 'زاحف تركي — يبحث بالاسم', brandColor: '#f59e0b', url: (t) => `/api/streams/${t}?category=turkish`, priority: 2, category: 'turkish', needsResolution: true },
  { name: 'Dizipal', displayName: 'Dizipal', description: 'زاحف تركي — يبحث بالاسم', brandColor: '#10b981', url: (t) => `/api/streams/${t}?category=turkish`, priority: 3, category: 'turkish', needsResolution: true },
];

const ANIMATION_PROVIDERS: Provider[] = [
  { name: 'vidlink', displayName: 'VidLink', description: 'أجود جودة للأنيميشن', brandColor: '#ffd700', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidlink.pro/tv/${t}/${s}/${e}` : `https://vidlink.pro/movie/${t}`, priority: 1, category: 'animation' },
  { name: 'VidFast', displayName: 'VidFast', description: 'سريع التحميل', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidfast.pro/tv/${t}/${s}/${e}?autoPlay=true` : `https://vidfast.pro/movie/${t}?autoPlay=true`, priority: 2, category: 'animation' },
  { name: 'screenscape', displayName: 'Screenscape', description: 'مصادر متعددة', brandColor: '#3b82f6', url: (t, tp, s, e) => `https://screenscape.me/embed?tmdb=${t}&type=${tp}${s ? `&season=${s}` : ''}${e ? `&episode=${e}` : ''}`, priority: 3, category: 'animation' },
  { name: 'EmbedSu', displayName: 'Embed.su', description: 'سريع ومستقر', brandColor: '#06b6d4', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.su/embed/tv/${t}/${s}/${e}` : `https://embed.su/embed/movie/${t}`, priority: 4, category: 'animation' },
  { name: 'AutoEmbed', displayName: 'AutoEmbed', description: 'كشف تلقائي', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.autoembed.app/embed/tv/${t}/${s}/${e}` : `https://player.autoembed.app/embed/movie/${t}`, priority: 5, category: 'animation' },
  { name: 'SmashyStream', displayName: 'SmashyStream', description: 'جودات متعددة', brandColor: '#f97316', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.smashystream.com/playere.php?tmdb=${t}&season=${s}&episode=${e}` : `https://embed.smashystream.com/playere.php?tmdb=${t}`, priority: 6, category: 'animation' },
];

const ANIME_PROVIDERS: AnimeProvider[] = [
  { name: 'VidLinkAnime', displayName: 'VidLink Anime', description: 'أنمي — أجود مصدر، مترجم/مدبلج', brandColor: '#ffd700', url: (id, ep, lang) => `https://vidlink.pro/anime/${id}/${ep}/${lang}`, priority: 1 },
  { name: 'VidPlusAnime', displayName: 'Anime Plus', description: 'أنمي — مشغل سريع', brandColor: '#a855f7', url: (id, ep, lang) => `https://player.vidplus.to/embed/anime/${id}/${ep}?dub=${lang === 'dub'}`, priority: 2 },
  { name: 'MegaPlay', displayName: 'Anime Mega', description: 'أنمي — مصدر إضافي', brandColor: '#a855f7', url: (id, ep, lang) => `https://megaplay.buzz/stream/ani/${id}/${ep}/${lang}`, priority: 3 },
];

export function getProviders(tmdbId: string, mediaType = 'movie', season?: number, episode?: number, platform?: string) {
  let sourceProviders: Provider[];
  switch (platform) {
    case 'shahid':
      sourceProviders = [...ARABIC_PROVIDERS, ...TURKISH_PROVIDERS];
      break;
    case 'disney':
      sourceProviders = [...ANIMATION_PROVIDERS, ...FOREIGN_PROVIDERS.slice(0, 4)];
      break;
    case 'netflix':
    default:
      sourceProviders = FOREIGN_PROVIDERS;
      break;
  }
  return sourceProviders.map(p => ({
    name: p.name,
    displayName: p.displayName,
    description: p.description,
    brandColor: p.brandColor,
    url: p.url(tmdbId, mediaType, season, episode),
    priority: p.priority,
    needsResolution: p.needsResolution,
    category: p.category,
  }));
}

export function getAnimeProviders(anilistId: string | number, episode = 1, language: 'sub' | 'dub' = 'sub') {
  return ANIME_PROVIDERS.map(p => ({
    name: p.name,
    displayName: p.displayName,
    description: p.description,
    brandColor: p.brandColor,
    url: p.url(anilistId, episode, language),
    priority: p.priority,
  }));
}

export function getProviderCount() {
  return {
    foreign: FOREIGN_PROVIDERS.length,
    arabic: ARABIC_PROVIDERS.length,
    turkish: TURKISH_PROVIDERS.length,
    animation: ANIMATION_PROVIDERS.length,
    anime: ANIME_PROVIDERS.length,
    total: FOREIGN_PROVIDERS.length + ARABIC_PROVIDERS.length + TURKISH_PROVIDERS.length + ANIMATION_PROVIDERS.length + ANIME_PROVIDERS.length,
  };
}
