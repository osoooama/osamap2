'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getProviders, getAnimeProviders } from '@/lib/providers';
import { trackProviderEvent, getProviderPerf, getProviderScore, type ProviderPerf } from '@/lib/providerPerf';
import { ChevronDown, Zap, Check, AlertCircle, Loader2, Tv, MonitorPlay, Layers, Maximize2, Minimize2, Volume2, VolumeX, Keyboard, PictureInPicture2 } from 'lucide-react';

const LOAD_TIMEOUT = 8000;
const FAST_LOAD_THRESHOLD = 1500;
const STORAGE_KEY = 'osk_smart_provider';
const FAVORITE_KEY = 'osk_favorite_server';
const NEXT_EP_DELAY = 10;

interface SmartPlayerProps {
  tmdbId?: string;
  animeId?: string;
  mediaType: string;
  season?: number;
  episode?: number;
  totalSeasons?: number;
  totalEpisodes?: number;
  category?: 'foreign' | 'arabic' | 'turkish' | 'anime' | 'animation';
  platform?: 'netflix' | 'shahid' | 'disney' | 'crunchyroll';
  onSeasonChange?: (season: number) => void;
  onEpisodeChange?: (episode: number) => void;
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

function getServerStats(name: string): { attempts: number; successRate: number } {
  const perf = getProviderPerf();
  const p = perf[name];
  if (!p || p.events.length === 0) return { attempts: 0, successRate: 0 };
  const successes = p.events.filter(e => e.success).length;
  return { attempts: p.events.length, successRate: (successes / p.events.length) * 100 };
}

export default function SmartPlayer({
  tmdbId, animeId, mediaType,
  season = 1, episode = 1,
  totalSeasons = 1, totalEpisodes = 24,
  category = 'foreign',
  platform = 'netflix',
  onSeasonChange, onEpisodeChange
}: SmartPlayerProps) {
  const isAnime = mediaType === 'anime' || !!animeId;
  const isTV = mediaType === 'tv';

  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);

  const providers = useMemo(() => {
    return isAnime && animeId
      ? getAnimeProviders(Number(animeId), currentEpisode, 'sub')
      : tmdbId ? getProviders(tmdbId, mediaType, currentSeason, currentEpisode, platform) : [];
  }, [tmdbId, animeId, mediaType, currentSeason, currentEpisode, isAnime, platform]);
  
  const filteredProviders = useMemo(() => {
    if (category === 'anime') return providers.filter((p: any) => p.category === 'anime' || p.category === 'all');
    if (category === 'animation') return providers.filter((p: any) => p.category === 'animation' || p.category === 'all');
    if (category === 'arabic') return providers.filter((p: any) => p.category === 'arabic' || p.category === 'all');
    if (category === 'turkish') return providers.filter((p: any) => p.category === 'turkish' || p.category === 'all');
    return providers.filter((p: any) => p.category === 'foreign' || p.category === 'all');
  }, [providers, category]);
  
  const [scrapedProviders, setScrapedProviders] = useState<any[]>([]);
  
  useEffect(() => {
    const scraped = filteredProviders.filter((p: any) => p.needsResolution);
    if (scraped.length === 0 || !tmdbId) return;
    
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
              results.push({
                ...p,
                name: `${p.name} (${stream.quality})`,
                displayName: `${p.displayName} ${stream.quality}`,
                url: stream.url,
                needsResolution: false,
              });
            }
          }
        } catch {}
      }
      setScrapedProviders(results);
    };
    
    fetchScraped();
  }, [tmdbId, mediaType, currentSeason, currentEpisode, filteredProviders]);
  
  const baseIframeProviders = useMemo(() => filteredProviders.filter((p: any) => !p.needsResolution), [filteredProviders]);
  const allIframeProviders = useMemo(() => [...scrapedProviders, ...baseIframeProviders], [scrapedProviders, baseIframeProviders]);

  const handleSeasonChange = useCallback((s: number) => {
    setCurrentSeason(s);
    setCurrentEpisode(1);
    onSeasonChange?.(s);
    onEpisodeChange?.(1);
    setShowEpisodeSelector(false);
    failedRef.current = new Set();
    setFailedIndices(new Set());
  }, [onSeasonChange, onEpisodeChange]);

  const handleEpisodeChange = useCallback((e: number) => {
    setCurrentEpisode(e);
    onEpisodeChange?.(e);
    setShowEpisodeSelector(false);
    failedRef.current = new Set();
    setFailedIndices(new Set());
  }, [onEpisodeChange]);

  useEffect(() => { setCurrentSeason(season); }, [season]);
  useEffect(() => { setCurrentEpisode(episode); }, [episode]);

  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [showMenu, setShowMenu] = useState(false);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [nextEpCountdown, setNextEpCountdown] = useState<number | null>(null);
  const [favoriteServer, setFavoriteServer] = useState<string | null>(null);

  const modeRef = useRef(mode);
  const currentIndexRef = useRef(currentIndex);
  const failedRef = useRef(new Set<number>());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadStartRef = useRef<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const providerCountRef = useRef(allIframeProviders.length);
  const nextEpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { providerCountRef.current = allIframeProviders.length; }, [allIframeProviders.length]);

  useEffect(() => {
    try {
      const fav = localStorage.getItem(FAVORITE_KEY);
      if (fav) setFavoriteServer(fav);
    } catch {}
  }, []);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (nextEpTimerRef.current) { clearInterval(nextEpTimerRef.current); nextEpTimerRef.current = null; }
    setNextEpCountdown(null);
  }, []);

  const tryNextFrom = useCallback((failedIndex: number, newFailed: Set<number>) => {
    if (modeRef.current !== 'auto') {
      setStatus('error');
      return;
    }
    for (let i = 0; i < providerCountRef.current; i++) {
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
  }, [cleanup]);

  const handleLoad = useCallback(() => {
    const loadTime = Date.now() - loadStartRef.current;
    const idx = currentIndexRef.current;

    if (loadTime < FAST_LOAD_THRESHOLD) {
      const p = allIframeProviders[idx];
      if (p) trackProviderEvent(p.name, false, loadTime);
      const nf = new Set(failedRef.current);
      nf.add(idx);
      failedRef.current = nf;
      setFailedIndices(new Set(nf));
      tryNextFrom(idx, nf);
      return;
    }

    cleanup();
    setStatus('playing');
    const p = allIframeProviders[idx];
    if (p) {
      trackProviderEvent(p.name, true, loadTime);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: p.name, index: idx, timestamp: Date.now() }));
        localStorage.setItem(FAVORITE_KEY, p.name);
        setFavoriteServer(p.name);
      } catch {}
    }
  }, [allIframeProviders, tryNextFrom, cleanup]);

  const handleError = useCallback(() => {
    cleanup();
    const idx = currentIndexRef.current;
    const p = allIframeProviders[idx];
    if (p) trackProviderEvent(p.name, false, Date.now() - loadStartRef.current);
    const nf = new Set(failedRef.current);
    nf.add(idx);
    failedRef.current = nf;
    setFailedIndices(new Set(nf));
    tryNextFrom(idx, nf);
  }, [allIframeProviders, tryNextFrom, cleanup]);

  const switchToAuto = useCallback(() => {
    cleanup();
    failedRef.current = new Set();
    setFailedIndices(new Set());
    setMode('auto');

    let startIdx = 0;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { name } = JSON.parse(cached);
        const idx = allIframeProviders.findIndex(p => p.name === name);
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
  }, [cleanup, allIframeProviders, tryNextFrom]);

  const selectManual = useCallback((index: number) => {
    cleanup();
    failedRef.current = new Set();
    setFailedIndices(new Set());
    setMode('manual');
    setCurrentIndex(index);
    setStatus('loading');
    loadStartRef.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      setStatus('error');
    }, LOAD_TIMEOUT);
    setShowMenu(false);
  }, [cleanup]);

  const switchToAutoRef = useRef(switchToAuto);
  useEffect(() => { switchToAutoRef.current = switchToAuto; }, [switchToAuto]);

  const cleanupRef = useRef(cleanup);
  useEffect(() => { cleanupRef.current = cleanup; }, [cleanup]);

  useEffect(() => {
    if (allIframeProviders.length === 0) return;
    switchToAutoRef.current();
    return () => cleanupRef.current();
  }, [tmdbId, animeId, mediaType, currentSeason, currentEpisode, allIframeProviders.length]);

  const activeProvider = currentIndex >= 0 ? allIframeProviders[currentIndex] : null;
  const activeUrl = activeProvider ? activeProvider.url : '';

  const showEpisodeUI = isAnime || isTV;

  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const handlePiP = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else {
      const video = el.querySelector('video');
      if (video) {
        video.requestPictureInPicture().catch(() => {});
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const startNextEpisodeCountdown = useCallback(() => {
    if (!isTV && !isAnime) return;
    if (currentEpisode >= totalEpisodes) return;
    setNextEpCountdown(NEXT_EP_DELAY);
    nextEpTimerRef.current = setInterval(() => {
      setNextEpCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (nextEpTimerRef.current) clearInterval(nextEpTimerRef.current);
          handleEpisodeChange(currentEpisode + 1);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentEpisode, totalEpisodes, isTV, isAnime, handleEpisodeChange]);

  const cancelNextEpisode = useCallback(() => {
    if (nextEpTimerRef.current) clearInterval(nextEpTimerRef.current);
    setNextEpCountdown(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      switch (e.key) {
        case 'f':
        case 'F':
          e.preventDefault();
          handleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          setShowMenu(false);
          setShowEpisodeSelector(false);
          setShowShortcuts(false);
          break;
        case '?':
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleFullscreen, toggleMute]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setShowMenu(false);
        setShowEpisodeSelector(false);
      }
    };
    if (showMenu || showEpisodeSelector) {
      document.addEventListener('click', handleClickOutside, true);
      return () => document.removeEventListener('click', handleClickOutside, true);
    }
  }, [showMenu, showEpisodeSelector]);

  return (
    <div className="w-full">
      {/* VIDEO PLAYER CARD */}
      <div ref={containerRef} className="relative w-full aspect-[16/10] sm:aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/[0.03]">
        {activeUrl && (
          <iframe
            ref={iframeRef}
            key={`${currentIndex}-${tmdbId}-${animeId}-${currentSeason}-${currentEpisode}`}
            src={activeUrl}
            className="w-full h-full border-0"
            style={{ opacity: status === 'playing' ? 1 : 0, transition: 'opacity 0.3s' }}
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}

        {/* Loading overlay */}
        {(status === 'loading' || status === 'idle') && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 z-10 pointer-events-none">
            <div className="text-center">
              <div className="relative w-10 h-10 mx-auto mb-3">
                <div className="absolute inset-0 border-2 border-emerald-600/20 rounded-full" />
                <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin" />
              </div>
              <p className="text-zinc-500 text-xs">
                {mode === 'auto' ? 'جاري تجربة السيرفر...' : 'جاري التحميل...'}
              </p>
              {activeProvider && (
                <p className="text-zinc-700 text-[10px] mt-1">
                  {activeProvider.displayName || activeProvider.name}
                  {mode === 'auto' && (
                    <span className="text-zinc-800 ml-1">
                      ({failedIndices.size + 1}/{allIframeProviders.length})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error overlay */}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95 backdrop-blur z-10">
            <div className="text-center px-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-zinc-300 font-semibold text-sm mb-1">جميع السيرفرات غير متاحة</p>
              <p className="text-zinc-600 text-xs mb-4">تم تجربة {allIframeProviders.length} سيرفر — جرب مرة أخرى أو اختر يدوياً</p>
              <button onClick={switchToAuto} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-all">
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {/* Next episode countdown */}
        {nextEpCountdown !== null && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
            <div className="text-white text-xs font-medium">
              الحلقة التالية خلال <span className="text-emerald-400 font-bold tabular-nums">{nextEpCountdown}</span> ثانية
            </div>
            <button onClick={cancelNextEpisode} className="px-2.5 py-1 rounded-lg bg-white/10 text-zinc-400 text-[10px] hover:bg-white/20 hover:text-white transition">
              إلغاء
            </button>
          </div>
        )}

        {/* Keyboard shortcuts help */}
        {showShortcuts && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
            <div className="bg-zinc-900/95 rounded-2xl border border-white/10 p-5 max-w-xs w-full mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-emerald-400" />
                اختصارات لوحة المفاتيح
              </h3>
              <div className="space-y-2">
                {[
                  ['F', 'ملء الشاشة'],
                  ['M', 'كتم الصوت'],
                  ['?', 'إظهار/إخفاء الاختصارات'],
                  ['Esc', 'إغلاق القوائم'],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">{desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-white/10 text-zinc-300 font-mono text-[10px]">{key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONTROL ROW */}
      <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
        {/* LEFT: Episode/Season selector */}
        <div className="relative" data-dropdown>
          {showEpisodeUI && (
            <button
              onClick={() => { setShowEpisodeSelector(!showEpisodeSelector); setShowMenu(false); }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all min-h-[44px] border ${
                showEpisodeSelector
                  ? 'bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg shadow-black/20'
                  : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/10 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {isAnime ? `الحلقة ${currentEpisode}` : `S${currentSeason} E${currentEpisode}`}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showEpisodeSelector ? 'rotate-180' : ''}`} />
            </button>
          )}

          {showEpisodeSelector && (
            <div className="absolute top-full mt-2 left-0 w-72 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50">
              {isTV && totalSeasons > 1 && (
                <>
                  <div className="px-3 py-2 border-b border-white/5">
                    <span className="text-[10px] text-zinc-600 font-medium flex items-center gap-1.5">
                      <Tv className="w-3 h-3" /> الموسم
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-3 py-2.5">
                    {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => (
                      <button
                        key={s}
                        onClick={() => handleSeasonChange(s)}
                        className={`min-h-[36px] min-w-[36px] rounded-lg text-xs font-semibold transition-all ${
                          s === currentSeason
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                            : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-white/5" />
                </>
              )}

              <div className="px-3 py-2 border-b border-white/5">
                <span className="text-[10px] text-zinc-600 font-medium flex items-center gap-1.5">
                  <MonitorPlay className="w-3 h-3" /> الحلقات
                </span>
              </div>
              <div className="max-h-52 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-5 gap-1.5 p-3">
                  {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(e => (
                    <button
                      key={e}
                      onClick={() => handleEpisodeChange(e)}
                      className={`min-h-[36px] min-w-[36px] rounded-lg text-xs font-semibold transition-all ${
                        e === currentEpisode
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {isAnime && (
                <div className="border-t border-white/5 px-3 py-2.5 flex gap-2">
                  {(['sub', 'dub'] as const).map(lang => (
                    <button
                      key={lang}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white`}
                    >
                      {lang === 'sub' ? '🔍 مترجم' : '🔊 مدبلج'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CENTER: Auto-progress indicator */}
        {mode === 'auto' && status === 'loading' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
            <span className="text-yellow-400 text-[10px] font-medium">
              {failedIndices.size + 1} / {allIframeProviders.length}
            </span>
          </div>
        )}

        {/* CENTER: Next episode button (when playing) */}
        {status === 'playing' && (isTV || isAnime) && currentEpisode < totalEpisodes && nextEpCountdown === null && (
          <button
            onClick={startNextEpisodeCountdown}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-medium hover:bg-emerald-500/20 transition"
          >
            <MonitorPlay className="w-3 h-3" />
            الحلقة التالية
          </button>
        )}

        {/* RIGHT: Controls */}
        <div className="flex items-center gap-1.5">
          {/* Server selector */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setShowMenu(!showMenu); setShowEpisodeSelector(false); }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all min-h-[44px] border ${
                showMenu
                  ? 'bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg shadow-black/20'
                  : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/10 hover:text-white'
              }`}
            >
              {mode === 'auto' ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>تلقائي</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>{activeProvider?.displayName || activeProvider?.name || 'المصدر'}</span>
                </>
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {showMenu && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50">
                <button
                  onClick={() => { setShowMenu(false); switchToAuto(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs transition-all hover:bg-white/5 ${mode === 'auto' ? 'text-yellow-400' : 'text-zinc-400'}`}
                >
                  <Zap className="w-4 h-4" />
                  <div className="text-right">
                    <div className="font-semibold">تلقائي (موصى)</div>
                    <div className="text-[10px] text-zinc-600">يختار أول مصدر يعمل</div>
                  </div>
                  {mode === 'auto' && <Check className="w-3.5 h-3.5 mr-auto text-yellow-400" />}
                </button>

                <div className="border-t border-white/5 px-3 py-1.5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600 font-medium">السيرفرات</span>
                  <span className="text-[10px] text-zinc-700">{allIframeProviders.length} متاح</span>
                </div>

                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {allIframeProviders.map((p, i) => {
                    const health = getServerHealth(p.name);
                    const stats = getServerStats(p.name);
                    const isFav = favoriteServer === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => selectManual(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-all hover:bg-white/5 ${
                          currentIndex === i && mode === 'manual' ? 'text-white bg-white/5' : 'text-zinc-500'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          health === 'good' ? 'bg-green-400' :
                          health === 'slow' ? 'bg-yellow-400' :
                          health === 'bad' ? 'bg-red-400/50' :
                          currentIndex === i && status === 'playing' ? 'bg-green-400' :
                          currentIndex === i && status === 'loading' ? 'bg-yellow-400 animate-pulse' :
                          failedIndices.has(i) ? 'bg-red-400/50' : 'bg-zinc-700'
                        }`} />
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium truncate">{p.displayName || p.name}</span>
                            {isFav && <span className="text-[8px] text-emerald-400">★</span>}
                          </div>
                          {p.description && (
                            <div className="text-[9px] text-zinc-600 truncate">{p.description}</div>
                          )}
                          {stats.attempts > 0 && (
                            <div className="text-[9px] text-zinc-700">
                              {stats.attempts} محاولة — {stats.successRate.toFixed(0)}% نجاح
                            </div>
                          )}
                        </div>
                        {currentIndex === i && mode === 'manual' && (
                          <Check className="w-3 h-3 text-green-400 shrink-0" />
                        )}
                        {p.brandColor && (
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.brandColor }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mute toggle */}
          {status === 'playing' && (
            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-zinc-400 hover:bg-white/10 hover:border-white/10 hover:text-white transition-all active:scale-95"
              title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* PiP button */}
          {status === 'playing' && (
            <button
              onClick={handlePiP}
              className="hidden sm:flex items-center justify-center w-10 h-10 bg-white/5 border border-white/5 rounded-xl text-zinc-400 hover:bg-white/10 hover:border-white/10 hover:text-white transition-all active:scale-95"
              title="صورة في صورة"
            >
              <PictureInPicture2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fullscreen */}
          {status === 'playing' && (
            <button
              onClick={handleFullscreen}
              className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-3.5 sm:h-10 bg-white/5 border border-white/5 rounded-xl text-zinc-400 text-xs font-medium hover:bg-white/10 hover:border-white/10 hover:text-white transition-all active:scale-95"
            >
              {document.fullscreenElement ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline ml-1.5">ملء الشاشة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
