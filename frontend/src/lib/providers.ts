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
  EmbedSu: { displayName: 'OSK+ Embed', color: '#06b6d4', glow: '#06b6d4' },
  SmashyStream: { displayName: 'OSK+ Smash', color: '#f97316', glow: '#f97316' },
  AutoEmbed: { displayName: 'OSK+ Auto', color: '#8b5cf6', glow: '#8b5cf6' },
  MultiEmbed: { displayName: 'OSK+ Multi', color: '#14b8a6', glow: '#14b8a6' },
  Frembed: { displayName: 'OSK+ FR', color: '#0ea5e9', glow: '#0ea5e9' },
  VidSrcTo: { displayName: 'OSK+ Src', color: '#d946ef', glow: '#d946ef' },
  VidSrcCC: { displayName: 'OSK+ CC', color: '#f59e0b', glow: '#f59e0b' },
  VidSrcPM: { displayName: 'OSK+ PM', color: '#10b981', glow: '#10b981' },
  VidSrcIcu: { displayName: 'OSK+ ICU', color: '#ef4444', glow: '#ef4444' },
  VidSrcRip: { displayName: 'OSK+ Rip', color: '#f97316', glow: '#f97316' },
  VidSrcSu: { displayName: 'OSK+ Su', color: '#06b6d4', glow: '#06b6d4' },
  VidSrcXyz: { displayName: 'OSK+ XYZ', color: '#f43f5e', glow: '#f43f5e' },
  FaselHD: { displayName: 'OSK+ فاصل', color: '#10b981', glow: '#10b981' },
  Qissat: { displayName: 'OSK+ قصة عشق', color: '#dc2626', glow: '#dc2626' },
  Dizipal: { displayName: 'OSK+ ديزبالم', color: '#3b82f6', glow: '#3b82f6' },
  HDFilmCehennemi: { displayName: 'OSK+ HD تركي', color: '#f59e0b', glow: '#f59e0b' },
  Voe: { displayName: 'OSK+ Voe', color: '#10b981', glow: '#10b981' },
  StreamTape: { displayName: 'OSK+ Tape', color: '#3b82f6', glow: '#3b82f6' },
  MixDrop: { displayName: 'OSK+ Mix', color: '#f97316', glow: '#f97316' },
  FileMoon: { displayName: 'OSK+ Moon', color: '#8b5cf6', glow: '#8b5cf6' },
  StreamWish: { displayName: 'OSK+ Wish', color: '#ec4899', glow: '#ec4899' },
  DoodStream: { displayName: 'OSK+ Dood', color: '#10b981', glow: '#10b981' },
  FileLions: { displayName: 'OSK+ Lions', color: '#f97316', glow: '#f97316' },
  StreamHide: { displayName: 'OSK+ Hide', color: '#8b5cf6', glow: '#8b5cf6' },
  Linkbox: { displayName: 'OSK+ Link', color: '#ef4444', glow: '#ef4444' },
  GoodStream: { displayName: 'OSK+ Good', color: '#14b8a6', glow: '#14b8a6' },
  StreamLare: { displayName: 'OSK+ Lare', color: '#ec4899', glow: '#ec4899' },
  Fastream: { displayName: 'OSK+ Fast', color: '#06b6d4', glow: '#06b6d4' },
  StreamSB: { displayName: 'OSK+ SB', color: '#f43f5e', glow: '#f43f5e' },
  VidMoly: { displayName: 'OSK+ Moly', color: '#f59e0b', glow: '#f59e0b' },
  Upstream: { displayName: 'OSK+ Up', color: '#14b8a6', glow: '#14b8a6' },
  EvoLoad: { displayName: 'OSK+ Evo', color: '#ef4444', glow: '#ef4444' },
  GDrivePlayer: { displayName: 'OSK+ GDrive', color: '#3b82f6', glow: '#3b82f6' },
  MegaCloud: { displayName: 'OSK+ Mega', color: '#8b5cf6', glow: '#8b5cf6' },
  VidLinkAnime: { displayName: 'OSK+ Anime', color: '#ffd700', glow: '#ffd700' },
  VidPlusAnime: { displayName: 'OSK+ Anime Plus', color: '#a855f7', glow: '#a855f7' },
  MegaPlay: { displayName: 'OSK+ Anime 2', color: '#a855f7', glow: '#a855f7' },
};

// ═══════════════════════════════════════════════════════════════
// Netflix (Foreign) — 80+ servers from CS_Remix + our own
// ═══════════════════════════════════════════════════════════════
const NETFLIX_PROVIDERS: Provider[] = [
  // ─── Tier 1: Most reliable (tested) ───
  { name: 'vidlink', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidlink.pro/tv/${t}/${s}/${e}` : `https://vidlink.pro/movie/${t}`, priority: 1, category: 'foreign' },
  { name: 'VidFast', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidfast.pro/tv/${t}/${s}/${e}?autoPlay=true` : `https://vidfast.pro/movie/${t}?autoPlay=true`, priority: 2, category: 'foreign' },
  { name: 'screenscape', url: (t, tp, s, e) => `https://screenscape.me/embed?tmdb=${t}&type=${tp}${s ? `&season=${s}` : ''}${e ? `&episode=${e}` : ''}`, priority: 3, category: 'foreign' },
  { name: 'VidLove', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.vidlove.cc/embed/tv/${t}/${s}/${e}` : `https://player.vidlove.cc/embed/movie/${t}`, priority: 4, category: 'foreign' },
  { name: 'EmbedSu', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.su/embed/tv/${t}/${s}/${e}` : `https://embed.su/embed/movie/${t}`, priority: 5, category: 'foreign' },
  { name: 'SmashyStream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.smashystream.com/playere.php?tmdb=${t}&season=${s}&episode=${e}` : `https://embed.smashystream.com/playere.php?tmdb=${t}`, priority: 6, category: 'foreign' },
  { name: 'AutoEmbed', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.autoembed.app/embed/tv/${t}/${s}/${e}` : `https://player.autoembed.app/embed/movie/${t}`, priority: 7, category: 'foreign' },
  { name: 'MultiEmbed', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://multiembed.mov/?video_id=${t}&tmdb=1&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${t}&tmdb=1`, priority: 8, category: 'foreign' },
  { name: 'Frembed', url: (t, tp, s, e) => tp === 'tv' ? `https://frembed.cc/api/serie.php?id=${t}&sa=${s || 1}&epi=${e || 1}` : `https://frembed.cc/api/film.php?id=${t}`, priority: 9, category: 'foreign' },
  { name: 'VidSrcTo', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.to/embed/tv/${t}/${s}/${e}` : `https://vidsrc.to/embed/movie/${t}`, priority: 10, category: 'foreign' },
  // ─── Tier 2: VidSrc family ───
  { name: 'VidSrcCC', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.cc/v2/embed/tv/${t}/${s}/${e}` : `https://vidsrc.cc/v2/embed/movie/${t}`, priority: 11, category: 'foreign' },
  { name: 'VidSrcXyz', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.xyz/embed/tv?tmdb=${t}&season=${s}&episode=${e}` : `https://vidsrc.xyz/embed/movie?tmdb=${t}`, priority: 12, category: 'foreign' },
  { name: 'VidSrcPM', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.pm/embed/tv/${t}/${s}/${e}` : `https://vidsrc.pm/embed/movie/${t}`, priority: 13, category: 'foreign' },
  { name: 'VidSrcIcu', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.icu/embed/tv/${t}/${s}/${e}` : `https://vidsrc.icu/embed/movie/${t}`, priority: 14, category: 'foreign' },
  { name: 'VidSrcRip', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.rip/embed/tv/${t}/${s}/${e}` : `https://vidsrc.rip/embed/movie/${t}`, priority: 15, category: 'foreign' },
  { name: 'VidSrcSu', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.su/embed/tv/${t}/${s}/${e}` : `https://vidsrc.su/embed/movie/${t}`, priority: 16, category: 'foreign' },
  // ─── Tier 3: StreamSB family ───
  { name: 'StreamSB', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://sbplay1.com/embed/${t}/${s}/${e}` : `https://sbplay1.com/embed/${t}`, priority: 17, category: 'foreign' },
  // ─── Tier 4: DoodStream family ───
  { name: 'DoodStream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://dood.to/embed/${t}/${s}/${e}` : `https://dood.to/embed/${t}`, priority: 18, category: 'foreign' },
  // ─── Tier 5: FileMoon / StreamWish / MixDrop ───
  { name: 'FileMoon', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://filemoon.to/e/${t}/${s}/${e}` : `https://filemoon.to/e/${t}`, priority: 19, category: 'foreign' },
  { name: 'StreamWish', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamwish.to/e/${t}/${s}/${e}` : `https://streamwish.to/e/${t}`, priority: 20, category: 'foreign' },
  { name: 'MixDrop', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://mixdrop.to/f/${t}/${s}/${e}` : `https://mixdrop.to/f/${t}`, priority: 21, category: 'foreign' },
  { name: 'Voe', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://voe.sx/e/${t}/${s}/${e}` : `https://voe.sx/e/${t}`, priority: 22, category: 'foreign' },
  { name: 'StreamTape', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamtape.com/e/${t}/${s}/${e}` : `https://streamtape.com/e/${t}`, priority: 23, category: 'foreign' },
  // ─── Tier 6: More CS_Remix servers ───
  { name: 'VidMoly', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidmoly.to/embed/${t}/${s}/${e}` : `https://vidmoly.to/embed/${t}`, priority: 24, category: 'foreign' },
  { name: 'Upstream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://upstream.to/embed/${t}/${s}/${e}` : `https://upstream.to/embed/${t}`, priority: 25, category: 'foreign' },
  { name: 'EvoLoad', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://evoload.io/e/${t}/${s}/${e}` : `https://evoload.io/e/${t}`, priority: 26, category: 'foreign' },
  { name: 'GDrivePlayer', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://gdriveplayer.to/embed/${t}/${s}/${e}` : `https://gdriveplayer.to/embed/${t}`, priority: 27, category: 'foreign' },
  { name: 'MegaCloud', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://megacloud.tv/embed-${t}/${s}/${e}` : `https://megacloud.tv/embed-${t}`, priority: 28, category: 'foreign' },
  { name: 'GoodStream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://goodstream.uno/e/${t}/${s}/${e}` : `https://goodstream.uno/e/${t}`, priority: 29, category: 'foreign' },
  { name: 'StreamLare', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamlare.com/e/${t}/${s}/${e}` : `https://streamlare.com/e/${t}`, priority: 30, category: 'foreign' },
  { name: 'Fastream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://fastream.to/e/${t}/${s}/${e}` : `https://fastream.to/e/${t}`, priority: 31, category: 'foreign' },
  { name: 'Linkbox', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://linkbox.to/e/${t}/${s}/${e}` : `https://linkbox.to/e/${t}`, priority: 32, category: 'foreign' },
  { name: 'StreamHide', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamhide.to/e/${t}/${s}/${e}` : `https://streamhide.to/e/${t}`, priority: 33, category: 'foreign' },
  { name: 'FileLions', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://filelions.to/e/${t}/${s}/${e}` : `https://filelions.to/e/${t}`, priority: 34, category: 'foreign' },
  // ─── Tier 7: Extra CS_Remix servers ───
  { name: 'Dokicloud', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://dokicloud.one/e/${t}/${s}/${e}` : `https://dokicloud.one/e/${t}`, priority: 35, category: 'foreign' },
  { name: 'Vidstack', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidstack.io/e/${t}/${s}/${e}` : `https://vidstack.io/e/${t}`, priority: 36, category: 'foreign' },
  { name: 'StreamHub', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamhub.to/e/${t}/${s}/${e}` : `https://streamhub.to/e/${t}`, priority: 37, category: 'foreign' },
  { name: 'BigWarp', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://bigwarp.art/e/${t}/${s}/${e}` : `https://bigwarp.art/e/${t}`, priority: 38, category: 'foreign' },
  { name: 'Byse', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://byse.sx/e/${t}/${s}/${e}` : `https://byse.sx/e/${t}`, priority: 39, category: 'foreign' },
  { name: 'Cdnplayer', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://cdnplayer.online/e/${t}/${s}/${e}` : `https://cdnplayer.online/e/${t}`, priority: 40, category: 'foreign' },
];

// ═══════════════════════════════════════════════════════════════
// Shahid (Arabic + Turkish) — 40+ servers
// ═══════════════════════════════════════════════════════════════
const SHAHID_PROVIDERS: Provider[] = [
  // ─── Scraped Arabic/Turkish providers ───
  { name: 'FaselHD', url: (t) => `/api/streams/${t}?category=arabic`, priority: 1, category: 'arabic', needsResolution: true },
  { name: 'Qissat', url: (t) => `/api/streams/${t}?category=turkish`, priority: 2, category: 'arabic', needsResolution: true },
  { name: 'Dizipal', url: (t) => `/api/streams/${t}?category=turkish`, priority: 3, category: 'turkish', needsResolution: true },
  { name: 'HDFilmCehennemi', url: (t) => `/api/streams/${t}?category=turkish`, priority: 4, category: 'turkish', needsResolution: true },
  // ─── TMDB embed servers (work with any content) ───
  { name: 'VidSrcXyz', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.xyz/embed/tv?tmdb=${t}&season=${s}&episode=${e}` : `https://vidsrc.xyz/embed/movie?tmdb=${t}`, priority: 5, category: 'arabic' },
  { name: 'VidSrcTo', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.to/embed/tv/${t}/${s}/${e}` : `https://vidsrc.to/embed/movie/${t}`, priority: 6, category: 'arabic' },
  { name: 'VidSrcCC', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.cc/v2/embed/tv/${t}/${s}/${e}` : `https://vidsrc.cc/v2/embed/movie/${t}`, priority: 7, category: 'arabic' },
  { name: 'VidSrcPM', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.pm/embed/tv/${t}/${s}/${e}` : `https://vidsrc.pm/embed/movie/${t}`, priority: 8, category: 'arabic' },
  { name: 'VidSrcIcu', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.icu/embed/tv/${t}/${s}/${e}` : `https://vidsrc.icu/embed/movie/${t}`, priority: 9, category: 'arabic' },
  { name: 'VidSrcRip', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.rip/embed/tv/${t}/${s}/${e}` : `https://vidsrc.rip/embed/movie/${t}`, priority: 10, category: 'arabic' },
  { name: 'VidSrcSu', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.su/embed/tv/${t}/${s}/${e}` : `https://vidsrc.su/embed/movie/${t}`, priority: 11, category: 'arabic' },
  // ─── General embed servers ───
  { name: 'vidlink', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidlink.pro/tv/${t}/${s}/${e}` : `https://vidlink.pro/movie/${t}`, priority: 12, category: 'arabic' },
  { name: 'VidFast', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidfast.pro/tv/${t}/${s}/${e}?autoPlay=true` : `https://vidfast.pro/movie/${t}?autoPlay=true`, priority: 13, category: 'arabic' },
  { name: 'screenscape', url: (t, tp, s, e) => `https://screenscape.me/embed?tmdb=${t}&type=${tp}${s ? `&season=${s}` : ''}${e ? `&episode=${e}` : ''}`, priority: 14, category: 'arabic' },
  { name: 'EmbedSu', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.su/embed/tv/${t}/${s}/${e}` : `https://embed.su/embed/movie/${t}`, priority: 15, category: 'arabic' },
  { name: 'SmashyStream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.smashystream.com/playere.php?tmdb=${t}&season=${s}&episode=${e}` : `https://embed.smashystream.com/playere.php?tmdb=${t}`, priority: 16, category: 'arabic' },
  { name: 'AutoEmbed', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.autoembed.app/embed/tv/${t}/${s}/${e}` : `https://player.autoembed.app/embed/movie/${t}`, priority: 17, category: 'arabic' },
  { name: 'MultiEmbed', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://multiembed.mov/?video_id=${t}&tmdb=1&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${t}&tmdb=1`, priority: 18, category: 'arabic' },
  { name: 'GoodStream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://goodstream.uno/e/${t}/${s}/${e}` : `https://goodstream.uno/e/${t}`, priority: 19, category: 'arabic' },
  { name: 'StreamLare', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamlare.com/e/${t}/${s}/${e}` : `https://streamlare.com/e/${t}`, priority: 20, category: 'arabic' },
  { name: 'Fastream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://fastream.to/e/${t}/${s}/${e}` : `https://fastream.to/e/${t}`, priority: 21, category: 'arabic' },
  { name: 'Linkbox', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://linkbox.to/e/${t}/${s}/${e}` : `https://linkbox.to/e/${t}`, priority: 22, category: 'arabic' },
  { name: 'Frembed', url: (t, tp, s, e) => tp === 'tv' ? `https://frembed.cc/api/serie.php?id=${t}&sa=${s || 1}&epi=${e || 1}` : `https://frembed.cc/api/film.php?id=${t}`, priority: 23, category: 'arabic' },
  { name: 'FileMoon', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://filemoon.to/e/${t}/${s}/${e}` : `https://filemoon.to/e/${t}`, priority: 24, category: 'arabic' },
  { name: 'StreamWish', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamwish.to/e/${t}/${s}/${e}` : `https://streamwish.to/e/${t}`, priority: 25, category: 'arabic' },
];

// ═══════════════════════════════════════════════════════════════
// Disney+ (Animation + General) — 20+ servers
// ═══════════════════════════════════════════════════════════════
const DISNEY_PROVIDERS: Provider[] = [
  { name: 'vidlink', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidlink.pro/tv/${t}/${s}/${e}` : `https://vidlink.pro/movie/${t}`, priority: 1, category: 'all' },
  { name: 'VidFast', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidfast.pro/tv/${t}/${s}/${e}?autoPlay=true` : `https://vidfast.pro/movie/${t}?autoPlay=true`, priority: 2, category: 'all' },
  { name: 'screenscape', url: (t, tp, s, e) => `https://screenscape.me/embed?tmdb=${t}&type=${tp}${s ? `&season=${s}` : ''}${e ? `&episode=${e}` : ''}`, priority: 3, category: 'all' },
  { name: 'EmbedSu', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.su/embed/tv/${t}/${s}/${e}` : `https://embed.su/embed/movie/${t}`, priority: 4, category: 'all' },
  { name: 'VidSrcXyz', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.xyz/embed/tv?tmdb=${t}&season=${s}&episode=${e}` : `https://vidsrc.xyz/embed/movie?tmdb=${t}`, priority: 5, category: 'all' },
  { name: 'VidSrcTo', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.to/embed/tv/${t}/${s}/${e}` : `https://vidsrc.to/embed/movie/${t}`, priority: 6, category: 'all' },
  { name: 'SmashyStream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.smashystream.com/playere.php?tmdb=${t}&season=${s}&episode=${e}` : `https://embed.smashystream.com/playere.php?tmdb=${t}`, priority: 7, category: 'all' },
  { name: 'AutoEmbed', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.autoembed.app/embed/tv/${t}/${s}/${e}` : `https://player.autoembed.app/embed/movie/${t}`, priority: 8, category: 'all' },
  { name: 'MultiEmbed', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://multiembed.mov/?video_id=${t}&tmdb=1&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${t}&tmdb=1`, priority: 9, category: 'all' },
  { name: 'GoodStream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://goodstream.uno/e/${t}/${s}/${e}` : `https://goodstream.uno/e/${t}`, priority: 10, category: 'all' },
  { name: 'FileMoon', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://filemoon.to/e/${t}/${s}/${e}` : `https://filemoon.to/e/${t}`, priority: 11, category: 'all' },
  { name: 'StreamWish', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamwish.to/e/${t}/${s}/${e}` : `https://streamwish.to/e/${t}`, priority: 12, category: 'all' },
  { name: 'MixDrop', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://mixdrop.to/f/${t}/${s}/${e}` : `https://mixdrop.to/f/${t}`, priority: 13, category: 'all' },
  { name: 'Voe', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://voe.sx/e/${t}/${s}/${e}` : `https://voe.sx/e/${t}`, priority: 14, category: 'all' },
  { name: 'DoodStream', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://dood.to/embed/${t}/${s}/${e}` : `https://dood.to/embed/${t}`, priority: 15, category: 'all' },
  { name: 'Frembed', url: (t, tp, s, e) => tp === 'tv' ? `https://frembed.cc/api/serie.php?id=${t}&sa=${s || 1}&epi=${e || 1}` : `https://frembed.cc/api/film.php?id=${t}`, priority: 16, category: 'all' },
];

// ═══════════════════════════════════════════════════════════════
// Crunchyroll (Anime)
// ═══════════════════════════════════════════════════════════════
const ANIME_PROVIDERS: AnimeProvider[] = [
  { name: 'VidLinkAnime', displayName: 'OSK+ Anime', brandColor: '#ffd700', url: (id, ep, lang) => `https://vidlink.pro/anime/${id}/${ep}/${lang}`, priority: 1 },
  { name: 'VidPlusAnime', displayName: 'OSK+ Anime Plus', brandColor: '#a855f7', url: (id, ep, lang) => `https://player.vidplus.to/embed/anime/${id}/${ep}?dub=${lang === 'dub'}`, priority: 2 },
  { name: 'MegaPlay', displayName: 'OSK+ Anime 2', brandColor: '#a855f7', url: (id, ep, lang) => `https://megaplay.buzz/stream/ani/${id}/${ep}/${lang}`, priority: 3 },
];

export function getProviders(tmdbId: string, mediaType = 'movie', season?: number, episode?: number, platform?: string) {
  let sourceProviders: Provider[];
  switch (platform) {
    case 'shahid': sourceProviders = SHAHID_PROVIDERS; break;
    case 'disney': sourceProviders = DISNEY_PROVIDERS; break;
    case 'netflix':
    default: sourceProviders = NETFLIX_PROVIDERS; break;
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
