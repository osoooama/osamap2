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

// ═══════════════════════════════════════════════════════════════
// FOREIGN — Servers for English/Foreign content (Netflix-style)
// ═══════════════════════════════════════════════════════════════
const FOREIGN_PROVIDERS: Provider[] = [
  // ─── Tier 1: Best embed servers ───
  { name: 'vidlink', displayName: 'OSK+ Play', description: 'Foreign — Best quality, auto-resolve', brandColor: '#ffd700', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidlink.pro/tv/${t}/${s}/${e}` : `https://vidlink.pro/movie/${t}`, priority: 1, category: 'foreign' },
  { name: 'VidFast', displayName: 'OSK+ Fast', description: 'Foreign — Fast loading, auto-play', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidfast.pro/tv/${t}/${s}/${e}?autoPlay=true` : `https://vidfast.pro/movie/${t}?autoPlay=true`, priority: 2, category: 'foreign' },
  { name: 'screenscape', displayName: 'OSK+ Max', description: 'Foreign — Multi-source, high quality', brandColor: '#3b82f6', url: (t, tp, s, e) => `https://screenscape.me/embed?tmdb=${t}&type=${tp}${s ? `&season=${s}` : ''}${e ? `&episode=${e}` : ''}`, priority: 3, category: 'foreign' },
  { name: 'VidLove', displayName: 'OSK+ Gold', description: 'Foreign — Premium embed, reliable', brandColor: '#ffd700', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.vidlove.cc/embed/tv/${t}/${s}/${e}` : `https://player.vidlove.cc/embed/movie/${t}`, priority: 4, category: 'foreign' },
  { name: 'EmbedSu', displayName: 'OSK+ Embed', description: 'Foreign — Quick embed, minimal ads', brandColor: '#06b6d4', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.su/embed/tv/${t}/${s}/${e}` : `https://embed.su/embed/movie/${t}`, priority: 5, category: 'foreign' },
  { name: 'SmashyStream', displayName: 'OSK+ Smash', description: 'Foreign — Multi-quality, fast', brandColor: '#f97316', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.smashystream.com/playere.php?tmdb=${t}&season=${s}&episode=${e}` : `https://embed.smashystream.com/playere.php?tmdb=${t}`, priority: 6, category: 'foreign' },
  { name: 'AutoEmbed', displayName: 'OSK+ Auto', description: 'Foreign — Auto-detect best source', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.autoembed.app/embed/tv/${t}/${s}/${e}` : `https://player.autoembed.app/embed/movie/${t}`, priority: 7, category: 'foreign' },
  { name: 'MultiEmbed', displayName: 'OSK+ Multi', description: 'Foreign — Multiple sources combined', brandColor: '#14b8a6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://multiembed.mov/?video_id=${t}&tmdb=1&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${t}&tmdb=1`, priority: 8, category: 'foreign' },
  { name: 'Frembed', displayName: 'OSK+ FR', description: 'Foreign — French-based, good quality', brandColor: '#0ea5e9', url: (t, tp, s, e) => tp === 'tv' ? `https://frembed.cc/api/serie.php?id=${t}&sa=${s || 1}&epi=${e || 1}` : `https://frembed.cc/api/film.php?id=${t}`, priority: 9, category: 'foreign' },
  { name: 'VidSrcTo', displayName: 'OSK+ Src', description: 'Foreign — VidSrc primary, reliable', brandColor: '#d946ef', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.to/embed/tv/${t}/${s}/${e}` : `https://vidsrc.to/embed/movie/${t}`, priority: 10, category: 'foreign' },
  // ─── Tier 2: VidSrc family ───
  { name: 'VidSrcCC', displayName: 'OSK+ CC', description: 'Foreign — VidSrc mirror, stable', brandColor: '#f59e0b', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.cc/v2/embed/tv/${t}/${s}/${e}` : `https://vidsrc.cc/v2/embed/movie/${t}`, priority: 11, category: 'foreign' },
  { name: 'VidSrcXyz', displayName: 'OSK+ XYZ', description: 'Foreign — VidSrc alternative', brandColor: '#f43f5e', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.xyz/embed/tv?tmdb=${t}&season=${s}&episode=${e}` : `https://vidsrc.xyz/embed/movie?tmdb=${t}`, priority: 12, category: 'foreign' },
  { name: 'VidSrcPM', displayName: 'OSK+ PM', description: 'Foreign — VidSrc plus version', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.pm/embed/tv/${t}/${s}/${e}` : `https://vidsrc.pm/embed/movie/${t}`, priority: 13, category: 'foreign' },
  { name: 'VidSrcIcu', displayName: 'OSK+ ICU', description: 'Foreign — VidSrc international', brandColor: '#ef4444', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.icu/embed/tv/${t}/${s}/${e}` : `https://vidsrc.icu/embed/movie/${t}`, priority: 14, category: 'foreign' },
  { name: 'VidSrcRip', displayName: 'OSK+ Rip', description: 'Foreign — VidSrc rip version', brandColor: '#f97316', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.rip/embed/tv/${t}/${s}/${e}` : `https://vidsrc.rip/embed/movie/${t}`, priority: 15, category: 'foreign' },
  { name: 'VidSrcSu', displayName: 'OSK+ Su', description: 'Foreign — VidSrc .su domain', brandColor: '#06b6d4', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidsrc.su/embed/tv/${t}/${s}/${e}` : `https://vidsrc.su/embed/movie/${t}`, priority: 16, category: 'foreign' },
  // ─── Tier 3: File hosting ───
  { name: 'StreamSB', displayName: 'OSK+ SB', description: 'Foreign — StreamSB host', brandColor: '#f43f5e', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://sbplay1.com/embed/${t}/${s}/${e}` : `https://sbplay1.com/embed/${t}`, priority: 17, category: 'foreign' },
  { name: 'DoodStream', displayName: 'OSK+ Dood', description: 'Foreign — DoodStream host', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://dood.to/embed/${t}/${s}/${e}` : `https://dood.to/embed/${t}`, priority: 18, category: 'foreign' },
  { name: 'FileMoon', displayName: 'OSK+ Moon', description: 'Foreign — FileMoon host', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://filemoon.to/e/${t}/${s}/${e}` : `https://filemoon.to/e/${t}`, priority: 19, category: 'foreign' },
  { name: 'StreamWish', displayName: 'OSK+ Wish', description: 'Foreign — StreamWish host', brandColor: '#ec4899', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamwish.to/e/${t}/${s}/${e}` : `https://streamwish.to/e/${t}`, priority: 20, category: 'foreign' },
  { name: 'MixDrop', displayName: 'OSK+ Mix', description: 'Foreign — MixDrop host', brandColor: '#f97316', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://mixdrop.to/f/${t}/${s}/${e}` : `https://mixdrop.to/f/${t}`, priority: 21, category: 'foreign' },
  { name: 'Voe', displayName: 'OSK+ Voe', description: 'Foreign — Voe host', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://voe.sx/e/${t}/${s}/${e}` : `https://voe.sx/e/${t}`, priority: 22, category: 'foreign' },
  { name: 'StreamTape', displayName: 'OSK+ Tape', description: 'Foreign — StreamTape host', brandColor: '#3b82f6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamtape.com/e/${t}/${s}/${e}` : `https://streamtape.com/e/${t}`, priority: 23, category: 'foreign' },
  // ─── Tier 4: Extra servers ───
  { name: 'VidMoly', displayName: 'OSK+ Moly', description: 'Foreign — VidMoly host', brandColor: '#f59e0b', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidmoly.to/embed/${t}/${s}/${e}` : `https://vidmoly.to/embed/${t}`, priority: 24, category: 'foreign' },
  { name: 'Upstream', displayName: 'OSK+ Up', description: 'Foreign — Upstream host', brandColor: '#14b8a6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://upstream.to/embed/${t}/${s}/${e}` : `https://upstream.to/embed/${t}`, priority: 25, category: 'foreign' },
  { name: 'EvoLoad', displayName: 'OSK+ Evo', description: 'Foreign — EvoLoad host', brandColor: '#ef4444', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://evoload.io/e/${t}/${s}/${e}` : `https://evoload.io/e/${t}`, priority: 26, category: 'foreign' },
  { name: 'GDrivePlayer', displayName: 'OSK+ GDrive', description: 'Foreign — Google Drive source', brandColor: '#3b82f6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://gdriveplayer.to/embed/${t}/${s}/${e}` : `https://gdriveplayer.to/embed/${t}`, priority: 27, category: 'foreign' },
  { name: 'MegaCloud', displayName: 'OSK+ Mega', description: 'Foreign — MegaCloud host', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://megacloud.tv/embed-${t}/${s}/${e}` : `https://megacloud.tv/embed-${t}`, priority: 28, category: 'foreign' },
  { name: 'GoodStream', displayName: 'OSK+ Good', description: 'Foreign — GoodStream host', brandColor: '#14b8a6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://goodstream.uno/e/${t}/${s}/${e}` : `https://goodstream.uno/e/${t}`, priority: 29, category: 'foreign' },
  { name: 'StreamLare', displayName: 'OSK+ Lare', description: 'Foreign — StreamLare host', brandColor: '#ec4899', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamlare.com/e/${t}/${s}/${e}` : `https://streamlare.com/e/${t}`, priority: 30, category: 'foreign' },
  { name: 'Fastream', displayName: 'OSK+ Fastream', description: 'Foreign — Fastream host', brandColor: '#06b6d4', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://fastream.to/e/${t}/${s}/${e}` : `https://fastream.to/e/${t}`, priority: 31, category: 'foreign' },
  { name: 'Linkbox', displayName: 'OSK+ Link', description: 'Foreign — Linkbox host', brandColor: '#ef4444', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://linkbox.to/e/${t}/${s}/${e}` : `https://linkbox.to/e/${t}`, priority: 32, category: 'foreign' },
  { name: 'StreamHide', displayName: 'OSK+ Hide', description: 'Foreign — StreamHide host', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamhide.to/e/${t}/${s}/${e}` : `https://streamhide.to/e/${t}`, priority: 33, category: 'foreign' },
  { name: 'FileLions', displayName: 'OSK+ Lions', description: 'Foreign — FileLions host', brandColor: '#f97316', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://filelions.to/e/${t}/${s}/${e}` : `https://filelions.to/e/${t}`, priority: 34, category: 'foreign' },
  { name: 'Dokicloud', displayName: 'OSK+ Doki', description: 'Foreign — Dokicloud host', brandColor: '#0ea5e9', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://dokicloud.one/e/${t}/${s}/${e}` : `https://dokicloud.one/e/${t}`, priority: 35, category: 'foreign' },
  { name: 'Vidstack', displayName: 'OSK+ Stack', description: 'Foreign — Vidstack player', brandColor: '#d946ef', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidstack.io/e/${t}/${s}/${e}` : `https://vidstack.io/e/${t}`, priority: 36, category: 'foreign' },
  { name: 'StreamHub', displayName: 'OSK+ Hub', description: 'Foreign — StreamHub host', brandColor: '#f43f5e', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamhub.to/e/${t}/${s}/${e}` : `https://streamhub.to/e/${t}`, priority: 37, category: 'foreign' },
  { name: 'BigWarp', displayName: 'OSK+ Warp', description: 'Foreign — BigWarp host', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://bigwarp.art/e/${t}/${s}/${e}` : `https://bigwarp.art/e/${t}`, priority: 38, category: 'foreign' },
  { name: 'Byse', displayName: 'OSK+ Byse', description: 'Foreign — Byse host', brandColor: '#f59e0b', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://byse.sx/e/${t}/${s}/${e}` : `https://byse.sx/e/${t}`, priority: 39, category: 'foreign' },
  { name: 'Cdnplayer', displayName: 'OSK+ CDN', description: 'Foreign — CDN Player', brandColor: '#ec4899', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://cdnplayer.online/e/${t}/${s}/${e}` : `https://cdnplayer.online/e/${t}`, priority: 40, category: 'foreign' },
];

// ═══════════════════════════════════════════════════════════════
// ARABIC — Scraped Arabic content from FaselHD + general embeds
// ═══════════════════════════════════════════════════════════════
const ARABIC_PROVIDERS: Provider[] = [
  // ─── Scraped Arabic sources (require backend API) ───
  { name: 'FaselHD', displayName: 'OSK+ فاصل HD', description: 'Arabic — FaselHD scraped streams', brandColor: '#10b981', url: (t) => `/api/streams/${t}?category=arabic`, priority: 1, category: 'arabic', needsResolution: true },
  // ─── General embed servers (may have Arabic subtitles) ───
  { name: 'vidlink', displayName: 'OSK+ Play Arabic', description: 'Arabic — General embed, Arabic subs', brandColor: '#ffd700', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidlink.pro/tv/${t}/${s}/${e}` : `https://vidlink.pro/movie/${t}`, priority: 2, category: 'arabic' },
  { name: 'VidFast', displayName: 'OSK+ Fast Arabic', description: 'Arabic — Fast embed, Arabic subs', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidfast.pro/tv/${t}/${s}/${e}?autoPlay=true` : `https://vidfast.pro/movie/${t}?autoPlay=true`, priority: 3, category: 'arabic' },
  { name: 'EmbedSu', displayName: 'OSK+ Embed Arabic', description: 'Arabic — Embed.su, Arabic subs', brandColor: '#06b6d4', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.su/embed/tv/${t}/${s}/${e}` : `https://embed.su/embed/movie/${t}`, priority: 4, category: 'arabic' },
  { name: 'SmashyStream', displayName: 'OSK+ Smash Arabic', description: 'Arabic — Smashy embed, Arabic subs', brandColor: '#f97316', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.smashystream.com/playere.php?tmdb=${t}&season=${s}&episode=${e}` : `https://embed.smashystream.com/playere.php?tmdb=${t}`, priority: 5, category: 'arabic' },
  { name: 'AutoEmbed', displayName: 'OSK+ Auto Arabic', description: 'Arabic — Auto-embed, Arabic subs', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.autoembed.app/embed/tv/${t}/${s}/${e}` : `https://player.autoembed.app/embed/movie/${t}`, priority: 6, category: 'arabic' },
  { name: 'MultiEmbed', displayName: 'OSK+ Multi Arabic', description: 'Arabic — Multi-source, Arabic subs', brandColor: '#14b8a6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://multiembed.mov/?video_id=${t}&tmdb=1&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${t}&tmdb=1`, priority: 7, category: 'arabic' },
  { name: 'GoodStream', displayName: 'OSK+ Good Arabic', description: 'Arabic — GoodStream, Arabic subs', brandColor: '#14b8a6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://goodstream.uno/e/${t}/${s}/${e}` : `https://goodstream.uno/e/${t}`, priority: 8, category: 'arabic' },
  { name: 'Frembed', displayName: 'OSK+ FR Arabic', description: 'Arabic — Frembed, Arabic subs', brandColor: '#0ea5e9', url: (t, tp, s, e) => tp === 'tv' ? `https://frembed.cc/api/serie.php?id=${t}&sa=${s || 1}&epi=${e || 1}` : `https://frembed.cc/api/film.php?id=${t}`, priority: 9, category: 'arabic' },
  { name: 'StreamWish', displayName: 'OSK+ Wish Arabic', description: 'Arabic — StreamWish, Arabic subs', brandColor: '#ec4899', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamwish.to/e/${t}/${s}/${e}` : `https://streamwish.to/e/${t}`, priority: 10, category: 'arabic' },
  { name: 'FileMoon', displayName: 'OSK+ Moon Arabic', description: 'Arabic — FileMoon, Arabic subs', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://filemoon.to/e/${t}/${s}/${e}` : `https://filemoon.to/e/${t}`, priority: 11, category: 'arabic' },
  { name: 'Linkbox', displayName: 'OSK+ Link Arabic', description: 'Arabic — Linkbox, Arabic subs', brandColor: '#ef4444', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://linkbox.to/e/${t}/${s}/${e}` : `https://linkbox.to/e/${t}`, priority: 12, category: 'arabic' },
];

// ═══════════════════════════════════════════════════════════════
// TURKISH — Scraped Turkish content + general embeds
// ═══════════════════════════════════════════════════════════════
const TURKISH_PROVIDERS: Provider[] = [
  // ─── Scraped Turkish sources (require backend API) ───
  { name: 'Qissat', displayName: 'OSK+ قصة عشق', description: 'Turkish — Qissat (قصة عشق) scraped', brandColor: '#dc2626', url: (t) => `/api/streams/${t}?category=turkish`, priority: 1, category: 'turkish', needsResolution: true },
  { name: 'Dizipal', displayName: 'OSK+ ديزبالم', description: 'Turkish — Dizipal scraped streams', brandColor: '#3b82f6', url: (t) => `/api/streams/${t}?category=turkish`, priority: 2, category: 'turkish', needsResolution: true },
  { name: 'HDFilmCehennemi', displayName: 'OSK+ HD تركي', description: 'Turkish — HDFilmCehennemi scraped', brandColor: '#f59e0b', url: (t) => `/api/streams/${t}?category=turkish`, priority: 3, category: 'turkish', needsResolution: true },
  // ─── General embed servers (may have Turkish subtitles) ───
  { name: 'vidlink', displayName: 'OSK+ Play Turkish', description: 'Turkish — General embed, Turkish subs', brandColor: '#ffd700', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidlink.pro/tv/${t}/${s}/${e}` : `https://vidlink.pro/movie/${t}`, priority: 4, category: 'turkish' },
  { name: 'VidFast', displayName: 'OSK+ Fast Turkish', description: 'Turkish — Fast embed, Turkish subs', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidfast.pro/tv/${t}/${s}/${e}?autoPlay=true` : `https://vidfast.pro/movie/${t}?autoPlay=true`, priority: 5, category: 'turkish' },
  { name: 'EmbedSu', displayName: 'OSK+ Embed Turkish', description: 'Turkish — Embed.su, Turkish subs', brandColor: '#06b6d4', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.su/embed/tv/${t}/${s}/${e}` : `https://embed.su/embed/movie/${t}`, priority: 6, category: 'turkish' },
  { name: 'SmashyStream', displayName: 'OSK+ Smash Turkish', description: 'Turkish — Smashy embed, Turkish subs', brandColor: '#f97316', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.smashystream.com/playere.php?tmdb=${t}&season=${s}&episode=${e}` : `https://embed.smashystream.com/playere.php?tmdb=${t}`, priority: 7, category: 'turkish' },
  { name: 'AutoEmbed', displayName: 'OSK+ Auto Turkish', description: 'Turkish — Auto-embed, Turkish subs', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.autoembed.app/embed/tv/${t}/${s}/${e}` : `https://player.autoembed.app/embed/movie/${t}`, priority: 8, category: 'turkish' },
  { name: 'MultiEmbed', displayName: 'OSK+ Multi Turkish', description: 'Turkish — Multi-source, Turkish subs', brandColor: '#14b8a6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://multiembed.mov/?video_id=${t}&tmdb=1&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${t}&tmdb=1`, priority: 9, category: 'turkish' },
  { name: 'GoodStream', displayName: 'OSK+ Good Turkish', description: 'Turkish — GoodStream, Turkish subs', brandColor: '#14b8a6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://goodstream.uno/e/${t}/${s}/${e}` : `https://goodstream.uno/e/${t}`, priority: 10, category: 'turkish' },
  { name: 'Frembed', displayName: 'OSK+ FR Turkish', description: 'Turkish — Frembed, Turkish subs', brandColor: '#0ea5e9', url: (t, tp, s, e) => tp === 'tv' ? `https://frembed.cc/api/serie.php?id=${t}&sa=${s || 1}&epi=${e || 1}` : `https://frembed.cc/api/film.php?id=${t}`, priority: 11, category: 'turkish' },
  { name: 'StreamWish', displayName: 'OSK+ Wish Turkish', description: 'Turkish — StreamWish, Turkish subs', brandColor: '#ec4899', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamwish.to/e/${t}/${s}/${e}` : `https://streamwish.to/e/${t}`, priority: 12, category: 'turkish' },
  { name: 'FileMoon', displayName: 'OSK+ Moon Turkish', description: 'Turkish — FileMoon, Turkish subs', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://filemoon.to/e/${t}/${s}/${e}` : `https://filemoon.to/e/${t}`, priority: 13, category: 'turkish' },
  { name: 'Linkbox', displayName: 'OSK+ Link Turkish', description: 'Turkish — Linkbox, Turkish subs', brandColor: '#ef4444', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://linkbox.to/e/${t}/${s}/${e}` : `https://linkbox.to/e/${t}`, priority: 14, category: 'turkish' },
];

// ═══════════════════════════════════════════════════════════════
// ANIMATION — Disney+ animation content
// ═══════════════════════════════════════════════════════════════
const ANIMATION_PROVIDERS: Provider[] = [
  { name: 'vidlink', displayName: 'OSK+ Play Animation', description: 'Animation — Best for animated content', brandColor: '#ffd700', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidlink.pro/tv/${t}/${s}/${e}` : `https://vidlink.pro/movie/${t}`, priority: 1, category: 'animation' },
  { name: 'VidFast', displayName: 'OSK+ Fast Animation', description: 'Animation — Fast loading', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://vidfast.pro/tv/${t}/${s}/${e}?autoPlay=true` : `https://vidfast.pro/movie/${t}?autoPlay=true`, priority: 2, category: 'animation' },
  { name: 'screenscape', displayName: 'OSK+ Max Animation', description: 'Animation — Multi-source quality', brandColor: '#3b82f6', url: (t, tp, s, e) => `https://screenscape.me/embed?tmdb=${t}&type=${tp}${s ? `&season=${s}` : ''}${e ? `&episode=${e}` : ''}`, priority: 3, category: 'animation' },
  { name: 'EmbedSu', displayName: 'OSK+ Embed Animation', description: 'Animation — Quick embed', brandColor: '#06b6d4', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.su/embed/tv/${t}/${s}/${e}` : `https://embed.su/embed/movie/${t}`, priority: 4, category: 'animation' },
  { name: 'SmashyStream', displayName: 'OSK+ Smash Animation', description: 'Animation — Smashy embed', brandColor: '#f97316', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://embed.smashystream.com/playere.php?tmdb=${t}&season=${s}&episode=${e}` : `https://embed.smashystream.com/playere.php?tmdb=${t}`, priority: 5, category: 'animation' },
  { name: 'AutoEmbed', displayName: 'OSK+ Auto Animation', description: 'Animation — Auto-detect source', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://player.autoembed.app/embed/tv/${t}/${s}/${e}` : `https://player.autoembed.app/embed/movie/${t}`, priority: 6, category: 'animation' },
  { name: 'MultiEmbed', displayName: 'OSK+ Multi Animation', description: 'Animation — Multi-source', brandColor: '#14b8a6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://multiembed.mov/?video_id=${t}&tmdb=1&s=${s}&e=${e}` : `https://multiembed.mov/?video_id=${t}&tmdb=1`, priority: 7, category: 'animation' },
  { name: 'GoodStream', displayName: 'OSK+ Good Animation', description: 'Animation — GoodStream host', brandColor: '#14b8a6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://goodstream.uno/e/${t}/${s}/${e}` : `https://goodstream.uno/e/${t}`, priority: 8, category: 'animation' },
  { name: 'FileMoon', displayName: 'OSK+ Moon Animation', description: 'Animation — FileMoon host', brandColor: '#8b5cf6', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://filemoon.to/e/${t}/${s}/${e}` : `https://filemoon.to/e/${t}`, priority: 9, category: 'animation' },
  { name: 'StreamWish', displayName: 'OSK+ Wish Animation', description: 'Animation — StreamWish host', brandColor: '#ec4899', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://streamwish.to/e/${t}/${s}/${e}` : `https://streamwish.to/e/${t}`, priority: 10, category: 'animation' },
  { name: 'MixDrop', displayName: 'OSK+ Mix Animation', description: 'Animation — MixDrop host', brandColor: '#f97316', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://mixdrop.to/f/${t}/${s}/${e}` : `https://mixdrop.to/f/${t}`, priority: 11, category: 'animation' },
  { name: 'Voe', displayName: 'OSK+ Voe Animation', description: 'Animation — Voe host', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://voe.sx/e/${t}/${s}/${e}` : `https://voe.sx/e/${t}`, priority: 12, category: 'animation' },
  { name: 'DoodStream', displayName: 'OSK+ Dood Animation', description: 'Animation — DoodStream host', brandColor: '#10b981', url: (t, tp, s, e) => tp === 'tv' && s && e ? `https://dood.to/embed/${t}/${s}/${e}` : `https://dood.to/embed/${t}`, priority: 13, category: 'animation' },
  { name: 'Frembed', displayName: 'OSK+ FR Animation', description: 'Animation — Frembed host', brandColor: '#0ea5e9', url: (t, tp, s, e) => tp === 'tv' ? `https://frembed.cc/api/serie.php?id=${t}&sa=${s || 1}&epi=${e || 1}` : `https://frembed.cc/api/film.php?id=${t}`, priority: 14, category: 'animation' },
];

// ═══════════════════════════════════════════════════════════════
// ANIME — Dedicated anime servers (Crunchyroll)
// ═══════════════════════════════════════════════════════════════
const ANIME_PROVIDERS: AnimeProvider[] = [
  { name: 'VidLinkAnime', displayName: 'OSK+ Anime', description: 'Anime — Best anime embed, sub/dub', brandColor: '#ffd700', url: (id, ep, lang) => `https://vidlink.pro/anime/${id}/${ep}/${lang}`, priority: 1 },
  { name: 'VidPlusAnime', displayName: 'OSK+ Anime Plus', description: 'Anime — VidPlus anime player', brandColor: '#a855f7', url: (id, ep, lang) => `https://player.vidplus.to/embed/anime/${id}/${ep}?dub=${lang === 'dub'}`, priority: 2 },
  { name: 'MegaPlay', displayName: 'OSK+ Anime Mega', description: 'Anime — MegaPlay anime host', brandColor: '#a855f7', url: (id, ep, lang) => `https://megaplay.buzz/stream/ani/${id}/${ep}/${lang}`, priority: 3 },
];

// ═══════════════════════════════════════════════════════════════
// PLATFORM ROUTING — Which categories each platform serves
// ═══════════════════════════════════════════════════════════════
// Netflix → foreign only
// Shahid → arabic + turkish
// Disney+ → animation + foreign
// Crunchyroll → anime only

export function getProviders(tmdbId: string, mediaType = 'movie', season?: number, episode?: number, platform?: string) {
  let sourceProviders: Provider[];
  switch (platform) {
    case 'shahid':
      sourceProviders = [...ARABIC_PROVIDERS, ...TURKISH_PROVIDERS];
      break;
    case 'disney':
      sourceProviders = [...ANIMATION_PROVIDERS, ...FOREIGN_PROVIDERS.slice(0, 20)];
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
