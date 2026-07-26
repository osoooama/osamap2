'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, ThumbsUp, ChevronDown, Zap, Check, AlertCircle, Loader2, MonitorPlay, Layers, Maximize2, Volume2, VolumeX, Subtitles, Tv } from 'lucide-react';
import { getTMDBTrailer, getMovieDetails, getSubtitles, type Subtitle } from '@/lib/api';
import { getProviders } from '@/lib/providers';
import { getProviderPerf, trackProviderEvent, getProviderScore } from '@/lib/providerPerf';
import Image from 'next/image';

const LOAD_TIMEOUT = 8000;
const FAST_LOAD_THRESHOLD = 1500;
const STORAGE_KEY = 'osk_smart_provider';

interface NetflixModalProps {
  visible: boolean;
  onClose: () => void;
  movie: {
    tmdb_id?: string;
    title?: string;
    overview?: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average?: number;
    release_date?: string;
    genre?: string;
    genres?: { id: number; name: string }[];
    runtime?: number;
    media_type?: string;
  } | null;
  accentColor?: string;
  platformRef?: string;
}

function getServerHealth(name: string): 'good' | 'slow' | 'bad' | 'unknown' {
  const perf = getProviderPerf();
  const p = perf[name];
  if (!p || p.events.length < 2) return 'unknown';
  const recent = p.events.slice(-5);
  const successRate = recent.filter(e => e.success).length / recent.length;
  const avgMs = recent.filter(e => e.success).reduce((s, e) => s + e.loadMs, 0) / Math.max(1, recent.filter(e => e.success).length);
  if (successRate < 0.3) return 'bad';
  if (successRate < 0.7 || avgMs > 4000) return 'slow';
  return 'good';
}

export default function NetflixModal({ visible, onClose, movie, accentColor = '#E50914', platformRef = 'netflix' }: NetflixModalProps) {
  const tmdbId = movie?.tmdb_id;
  const mediaType = movie?.media_type || 'movie';
  const isTV = mediaType === 'tv';

  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [fullDetails, setFullDetails] = useState<any>(null);

  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(24);

  const [providers, setProviders] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showEpisodeMenu, setShowEpisodeMenu] = useState(false);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [selectedSub, setSelectedSub] = useState<Subtitle | null>(null);
  const [showSubtitles, setShowSubtitles] = useState(false);

  const failedRef = useRef(new Set<number>());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadStartRef = useRef<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const backdropUrl = movie?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null;
  const matchPercent = movie?.vote_average ? Math.round(movie.vote_average * 10) : 0;
  const year = movie?.release_date ? movie.release_date.slice(0, 4) : null;
  const runtime = movie?.runtime;

  useEffect(() => {
    if (!tmdbId || !visible) return;
    setTrailerLoading(true);
    getTMDBTrailer(tmdbId, mediaType as 'movie' | 'tv').then(key => {
      setTrailerKey(key);
      setTrailerLoading(false);
    }).catch(() => setTrailerLoading(false));
  }, [tmdbId, mediaType, visible]);

  useEffect(() => {
    if (!tmdbId || !visible) return;
    getMovieDetails(tmdbId).then(data => {
      if (data) {
        setFullDetails(data);
        if (data.seasons) {
          setTotalSeasons(data.seasons.length);
          const ep = data.seasons.find((s: any) => s.season_number === currentSeason);
          if (ep) setTotalEpisodes(ep.episode_count);
        }
      }
    }).catch(() => {});
  }, [tmdbId, visible]);

  useEffect(() => {
    if (!tmdbId) return;
    try {
      const favs = JSON.parse(localStorage.getItem('osk_favorites') || '[]');
      setIsFav(favs.some((f: any) => f.tmdb_id === tmdbId));
    } catch {}
  }, [tmdbId]);

  const toggleFav = useCallback(() => {
    if (!tmdbId || !movie) return;
    try {
      let favs = JSON.parse(localStorage.getItem('osk_favorites') || '[]');
      if (isFav) {
        favs = favs.filter((f: any) => f.tmdb_id !== tmdbId);
      } else {
        favs.push({ tmdb_id: tmdbId, title: movie.title, poster: movie.poster_path, media_type: mediaType, backdrop_path: movie.backdrop_path, vote_average: movie.vote_average, release_date: movie.release_date, genres: movie.genres, overview: movie.overview });
      }
      localStorage.setItem('osk_favorites', JSON.stringify(favs));
      setIsFav(!isFav);
    } catch {}
  }, [tmdbId, movie, isFav, mediaType]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  const currentProviders = useMemo(() => {
    if (!tmdbId) return [];
    const cat = platformRef === 'shahid' ? 'arabic' : platformRef === 'disney' ? 'animation' : platformRef === 'crunchyroll' ? 'anime' : 'foreign';
    return getProviders(tmdbId, mediaType, currentSeason, currentEpisode, platformRef as any)
      .filter((p: any) => cat === 'foreign' ? (p.category === 'foreign' || p.category === 'all') : (p.category === cat || p.category === 'all'));
  }, [tmdbId, mediaType, currentSeason, currentEpisode, platformRef]);

  const [scrapedProviders, setScrapedProviders] = useState<any[]>([]);

  useEffect(() => {
    if (!showPlayer || !tmdbId) return;
    const scraped = currentProviders.filter((p: any) => p.needsResolution);
    if (scraped.length === 0) { setScrapedProviders([]); return; }
    const fetchScraped = async () => {
      const results: any[] = [];
      for (const p of scraped) {
        try {
          const apiUrl = String(p.url);
          const fullUrl = apiUrl.startsWith('http') ? apiUrl : `${process.env.NEXT_PUBLIC_API_URL || 'https://osamap2.onrender.com'}${apiUrl}`;
          const resp = await fetch(fullUrl, { signal: AbortSignal.timeout(5000) });
          if (!resp.ok) continue;
          const data = await resp.json();
          if (data.streams && data.streams.length > 0) {
            for (const stream of data.streams) {
              results.push({ ...p, name: `${p.name} (${stream.quality})`, displayName: `${p.displayName} ${stream.quality}`, url: stream.url, needsResolution: false });
            }
          }
        } catch {}
      }
      setScrapedProviders(results);
    };
    fetchScraped();
  }, [showPlayer, tmdbId, mediaType, currentSeason, currentEpisode, currentProviders]);

  const baseIframeProviders = useMemo(() => currentProviders.filter((p: any) => !p.needsResolution), [currentProviders]);
  const allProviders = useMemo(() => [...scrapedProviders, ...baseIframeProviders], [scrapedProviders, baseIframeProviders]);
  const activeProvider = currentIndex >= 0 ? allProviders[currentIndex] : null;
  const activeUrl = activeProvider ? activeProvider.url : '';

  const tryNextFrom = useCallback((failedIndex: number, newFailed: Set<number>) => {
    for (let i = 0; i < allProviders.length; i++) {
      if (i !== failedIndex && !newFailed.has(i)) {
        setCurrentIndex(i);
        setStatus('loading');
        loadStartRef.current = Date.now();
        cleanup();
        timeoutRef.current = setTimeout(() => {
          const nf = new Set(failedRef.current);
          nf.add(i);
          failedRef.current = nf;
          setFailedIndices(new Set(nf));
          tryNextFrom(i, nf);
        }, LOAD_TIMEOUT);
        return;
      }
    }
    setStatus('error');
  }, [allProviders.length, cleanup]);

  const startAutoPlay = useCallback(() => {
    cleanup();
    failedRef.current = new Set();
    setFailedIndices(new Set());
    let startIdx = 0;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { name } = JSON.parse(cached);
        const idx = allProviders.findIndex(p => p.name === name);
        if (idx >= 0) startIdx = idx;
      }
    } catch {}
    setCurrentIndex(startIdx);
    setStatus('loading');
    loadStartRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      const nf = new Set<number>();
      nf.add(startIdx);
      failedRef.current = nf;
      setFailedIndices(new Set(nf));
      tryNextFrom(startIdx, nf);
    }, LOAD_TIMEOUT);
  }, [allProviders, cleanup, tryNextFrom]);

  const selectManual = useCallback((index: number) => {
    cleanup();
    failedRef.current = new Set();
    setFailedIndices(new Set());
    setCurrentIndex(index);
    setStatus('loading');
    loadStartRef.current = Date.now();
    timeoutRef.current = setTimeout(() => setStatus('error'), LOAD_TIMEOUT);
    setShowServerMenu(false);
  }, [cleanup]);

  useEffect(() => {
    if (showPlayer && allProviders.length > 0) startAutoPlay();
    return () => cleanup();
  }, [showPlayer, allProviders.length, currentSeason, currentEpisode]);

  useEffect(() => {
    if (showPlayer && tmdbId) {
      getSubtitles(tmdbId, mediaType, currentSeason, currentEpisode)
        .then(setSubtitles).catch(() => setSubtitles([]));
    }
  }, [showPlayer, tmdbId, mediaType, currentSeason, currentEpisode]);

  const handleLoad = useCallback(() => {
    const loadTime = Date.now() - loadStartRef.current;
    const idx = currentIndex;
    if (loadTime < FAST_LOAD_THRESHOLD) {
      const nf = new Set(failedRef.current);
      nf.add(idx);
      failedRef.current = nf;
      setFailedIndices(new Set(nf));
      tryNextFrom(idx, nf);
      return;
    }
    cleanup();
    setStatus('playing');
    const p = allProviders[idx];
    if (p) {
      trackProviderEvent(p.name, true, loadTime);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: p.name, index: idx, timestamp: Date.now() })); } catch {}
    }
  }, [currentIndex, allProviders, cleanup, tryNextFrom]);

  const handleError = useCallback(() => {
    cleanup();
    const idx = currentIndex;
    const p = allProviders[idx];
    if (p) trackProviderEvent(p.name, false, Date.now() - loadStartRef.current);
    const nf = new Set(failedRef.current);
    nf.add(idx);
    failedRef.current = nf;
    setFailedIndices(new Set(nf));
    tryNextFrom(idx, nf);
  }, [currentIndex, allProviders, cleanup, tryNextFrom]);

  const handleSeasonChange = useCallback((s: number) => {
    setCurrentSeason(s);
    setCurrentEpisode(1);
    setShowEpisodeMenu(false);
    failedRef.current = new Set();
    setFailedIndices(new Set());
    cleanup();
    const ep = fullDetails?.seasons?.find((se: any) => se.season_number === s);
    if (ep) setTotalEpisodes(ep.episode_count);
  }, [fullDetails, cleanup]);

  const handleEpisodeChange = useCallback((e: number) => {
    setCurrentEpisode(e);
    setShowEpisodeMenu(false);
    failedRef.current = new Set();
    setFailedIndices(new Set());
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showServerMenu) setShowServerMenu(false);
        else if (showEpisodeMenu) setShowEpisodeMenu(false);
        else if (showSubtitles) setShowSubtitles(false);
        else if (showPlayer) setShowPlayer(false);
        else onClose();
      }
    };
    if (visible) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [visible, onClose, showPlayer, showServerMenu, showEpisodeMenu, showSubtitles]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (showServerMenu) setShowServerMenu(false);
      else if (showEpisodeMenu) setShowEpisodeMenu(false);
      else onClose();
    }
  };

  const resetPlayer = useCallback(() => {
    setShowPlayer(false);
    setCurrentIndex(-1);
    setStatus('idle');
    setFailedIndices(new Set());
    failedRef.current = new Set();
    cleanup();
  }, [cleanup]);

  return (
    <AnimatePresence>
      {visible && movie && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/90 backdrop-blur-sm overflow-y-auto py-6 sm:py-10 px-2 sm:px-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-[#181818] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/80"
          >
            {/* Close button */}
            <button
              onClick={() => { if (showPlayer) resetPlayer(); else onClose(); }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#181818]/80 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-[#282828] transition-colors group"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* ═══ PLAYER AREA ═══ */}
            {showPlayer ? (
              <div className="relative w-full aspect-video bg-black">
                {/* Player iframe/video */}
                {activeUrl && (() => {
                  const isDirect = /\.(m3u8|mp4|mkv|webm)(\?|$)/i.test(activeUrl);
                  return isDirect ? (
                    <video
                      key={`${currentIndex}-${currentSeason}-${currentEpisode}`}
                      src={activeUrl}
                      className="w-full h-full object-contain"
                      style={{ opacity: status === 'playing' ? 1 : 0, transition: 'opacity 0.3s' }}
                      controls autoPlay
                      onError={handleError}
                    />
                  ) : (
                    <iframe
                      ref={iframeRef}
                      key={`${currentIndex}-${currentSeason}-${currentEpisode}`}
                      src={activeUrl}
                      className="w-full h-full border-0"
                      style={{ opacity: status === 'playing' ? 1 : 0, transition: 'opacity 0.3s' }}
                      allowFullScreen
                      allow="autoplay; encrypted-media; fullscreen"
                      onLoad={handleLoad}
                      onError={handleError}
                    />
                  );
                })()}

                {/* Loading overlay */}
                {(status === 'loading' || status === 'idle') && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 pointer-events-none">
                    <div className="text-center">
                      <div className="relative w-10 h-10 mx-auto mb-3">
                        <div className="absolute inset-0 border-2 border-emerald-600/20 rounded-full" />
                        <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin" />
                      </div>
                      <p className="text-zinc-400 text-xs">جاري تحميل السيرفر...</p>
                      {activeProvider && (
                        <p className="text-zinc-600 text-[10px] mt-1">
                          {activeProvider.displayName || activeProvider.name}
                          <span className="ml-1">({failedIndices.size + 1}/{allProviders.length})</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                    <div className="text-center px-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                      <p className="text-zinc-300 font-semibold text-sm mb-1">جميع السيرفرات غير متاحة</p>
                      <p className="text-zinc-600 text-xs mb-4">تم تجربة {allProviders.length} سيرفر</p>
                      <button onClick={() => { failedRef.current = new Set(); setFailedIndices(new Set()); startAutoPlay(); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all">
                        إعادة المحاولة
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom controls bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-3 px-3 sm:px-4">
                  <div className="flex items-center justify-between gap-2">
                    {/* Left: Season/Episode */}
                    <div className="flex items-center gap-2">
                      {isTV && totalSeasons > 1 && (
                        <div className="relative" data-dropdown>
                          <button
                            onClick={() => { setShowEpisodeMenu(!showEpisodeMenu); setShowServerMenu(false); setShowSubtitles(false); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur text-[10px] sm:text-xs text-white hover:bg-white/20 transition"
                          >
                            <Layers className="w-3 h-3 text-purple-400" />
                            <span>S{currentSeason} E{currentEpisode}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showEpisodeMenu ? 'rotate-180' : ''}`} />
                          </button>

                          {showEpisodeMenu && (
                            <div className="absolute bottom-full mb-2 left-0 w-64 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                              <div className="px-3 py-2 border-b border-white/5">
                                <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5"><Tv className="w-3 h-3" /> الموسم</span>
                              </div>
                              <div className="flex flex-wrap gap-1 p-2.5">
                                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => (
                                  <button key={s} onClick={() => handleSeasonChange(s)} className={`min-w-[32px] h-8 rounded-lg text-[10px] font-semibold transition-all ${s === currentSeason ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}>
                                    {s}
                                  </button>
                                ))}
                              </div>
                              <div className="border-t border-white/5 px-3 py-2">
                                <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5"><MonitorPlay className="w-3 h-3" /> الحلقات</span>
                              </div>
                              <div className="max-h-40 overflow-y-auto p-2.5 grid grid-cols-6 gap-1">
                                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(e => (
                                  <button key={e} onClick={() => handleEpisodeChange(e)} className={`min-w-[28px] h-7 rounded-lg text-[10px] font-semibold transition-all ${e === currentEpisode ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}>
                                    {e}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Server + Subtitles + Fullscreen */}
                    <div className="flex items-center gap-1.5">
                      {/* Subtitles */}
                      {subtitles.length > 0 && (
                        <div className="relative" data-dropdown>
                          <button
                            onClick={() => { setShowSubtitles(!showSubtitles); setShowServerMenu(false); setShowEpisodeMenu(false); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur text-[10px] sm:text-xs text-white hover:bg-white/20 transition"
                          >
                            <Subtitles className="w-3 h-3 text-cyan-400" />
                            <span className="hidden sm:inline">{selectedSub ? selectedSub.lang_name : 'ترجمة'}</span>
                          </button>
                          {showSubtitles && (
                            <div className="absolute bottom-full mb-2 right-0 w-48 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                              <button onClick={() => { setSelectedSub(null); setShowSubtitles(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-white/5 ${!selectedSub ? 'text-cyan-400' : 'text-zinc-500'}`}>
                                <span>إيقاف</span>
                                {!selectedSub && <Check className="w-3 h-3 mr-auto text-cyan-400" />}
                              </button>
                              <div className="max-h-40 overflow-y-auto">
                                {subtitles.map((sub, i) => (
                                  <button key={i} onClick={() => { setSelectedSub(sub); setShowSubtitles(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-white/5 ${selectedSub?.url === sub.url ? 'text-cyan-400' : 'text-zinc-500'}`}>
                                    {sub.flag_url && <img src={sub.flag_url} alt="" className="w-3.5 h-2.5 rounded-sm" />}
                                    <span>{sub.lang_name}</span>
                                    {selectedSub?.url === sub.url && <Check className="w-3 h-3 text-cyan-400 mr-auto" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Server selector */}
                      <div className="relative" data-dropdown>
                        <button
                          onClick={() => { setShowServerMenu(!showServerMenu); setShowEpisodeMenu(false); setShowSubtitles(false); }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur text-[10px] sm:text-xs text-white hover:bg-white/20 transition"
                        >
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="hidden sm:inline">{activeProvider?.displayName || 'سيرفر'}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${showServerMenu ? 'rotate-180' : ''}`} />
                        </button>
                        {showServerMenu && (
                          <div className="absolute bottom-full mb-2 right-0 w-56 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                            <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
                              <span className="text-[10px] text-zinc-600">السيرفرات</span>
                              <span className="text-[10px] text-zinc-700">{allProviders.length}</span>
                            </div>
                            <div className="max-h-52 overflow-y-auto">
                              {allProviders.map((p, i) => {
                                const health = getServerHealth(p.name);
                                return (
                                  <button key={p.name} onClick={() => selectManual(i)} className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-white/5 ${currentIndex === i ? 'text-white' : 'text-zinc-500'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${health === 'good' ? 'bg-green-400' : health === 'slow' ? 'bg-yellow-400' : health === 'bad' ? 'bg-red-400/50' : currentIndex === i && status === 'playing' ? 'bg-green-400' : currentIndex === i && status === 'loading' ? 'bg-yellow-400 animate-pulse' : failedIndices.has(i) ? 'bg-red-400/50' : 'bg-zinc-700'}`} />
                                    <span className="truncate">{p.displayName || p.name}</span>
                                    {currentIndex === i && status === 'playing' && <Check className="w-3 h-3 text-green-400 mr-auto" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fullscreen */}
                      <button
                        onClick={() => {
                          const el = iframeRef.current?.parentElement;
                          if (el) {
                            if (document.fullscreenElement) document.exitFullscreen();
                            else el.requestFullscreen().catch(() => {});
                          }
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ═══ BACKDROP / TRAILER AREA ═══ */
              <div className="relative w-full aspect-video bg-black">
                {trailerKey ? (
                  <div className="relative w-full h-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent pointer-events-none" />
                  </div>
                ) : backdropUrl ? (
                  <>
                    <img src={backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/30 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-4xl font-black text-zinc-700">OSK+</span>
                  </div>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-4 left-5 sm:left-6 right-16 pointer-events-none">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md overflow-hidden ring-1 ring-red-500/30">
                      <Image src="/netflix.webp" alt="Netflix" width={28} height={28} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-red-500 text-[9px] sm:text-[10px] font-bold tracking-wider">NETFLIX</span>
                  </div>
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white drop-shadow-2xl leading-tight">
                    {movie.title}
                  </h2>
                </div>

                {trailerLoading && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 text-[10px] text-zinc-400 backdrop-blur-md">
                    جاري تحميل التريلر...
                  </div>
                )}
              </div>
            )}

            {/* ═══ CONTENT BELOW ═══ */}
            <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
              {/* Action buttons */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => setShowPlayer(true)}
                  className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-lg font-bold text-sm text-white transition-all duration-200 hover:brightness-110 active:scale-95 shadow-lg"
                  style={{ backgroundColor: accentColor, boxShadow: `0 4px 20px ${accentColor}50` }}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                  شاهد الآن
                </button>
                <button
                  onClick={toggleFav}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                    isFav ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  <Plus className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isFav ? 'rotate-45' : ''}`} />
                </button>
                <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 bg-white/5 border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95">
                  <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                {matchPercent > 0 && <span className="text-emerald-400 font-bold">{matchPercent}% Match</span>}
                {year && <span className="text-zinc-400">{year}</span>}
                {runtime && <span className="text-zinc-400">{Math.floor(runtime / 60)} س {runtime % 60} د</span>}
                <span className="px-1.5 py-0.5 rounded border border-white/10 text-zinc-400 text-[9px] font-medium">HD</span>
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.slice(0, 5).map((g) => (
                    <span key={g.id} className="px-2 py-0.5 rounded text-[10px] sm:text-xs bg-white/5 text-zinc-400 border border-white/5">{g.name}</span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">{movie.overview}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
