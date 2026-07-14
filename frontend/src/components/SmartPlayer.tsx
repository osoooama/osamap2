'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getProviders, getAnimeProviders } from '@/lib/providers';
import { trackProviderEvent } from '@/lib/providerPerf';
import { ChevronDown, ChevronUp, Zap, Check, AlertCircle, Loader2, Tv, Film, MonitorPlay, ArrowLeft, ArrowRight, Layers, Maximize2 } from 'lucide-react';

const LOAD_TIMEOUT = 8000;
const FAST_LOAD_THRESHOLD = 1500;
const STORAGE_KEY = 'osk_smart_provider';

interface SmartPlayerProps {
  tmdbId?: string;
  animeId?: string;
  mediaType: string;
  season?: number;
  episode?: number;
  totalSeasons?: number;
  totalEpisodes?: number;
  onSeasonChange?: (season: number) => void;
  onEpisodeChange?: (episode: number) => void;
  onFullscreen?: () => void;
}

export default function SmartPlayer({
  tmdbId, animeId, mediaType,
  season = 1, episode = 1,
  totalSeasons = 1, totalEpisodes = 24,
  onSeasonChange, onEpisodeChange, onFullscreen
}: SmartPlayerProps) {
  const isAnime = mediaType === 'anime' || !!animeId;
  const isTV = mediaType === 'tv';

  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);

  const providers = isAnime && animeId
    ? getAnimeProviders(Number(animeId), currentEpisode, 'sub')
    : tmdbId ? getProviders(tmdbId, mediaType, currentSeason, currentEpisode) : [];
  const iframeProviders = providers.filter((p: any) => !p.needsResolution);

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

  const modeRef = useRef(mode);
  const currentIndexRef = useRef(currentIndex);
  const failedRef = useRef(new Set<number>());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadStartRef = useRef<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onFullscreenRef = useRef(onFullscreen);
  const providerCountRef = useRef(iframeProviders.length);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { onFullscreenRef.current = onFullscreen; }, [onFullscreen]);
  useEffect(() => { providerCountRef.current = iframeProviders.length; }, [iframeProviders.length]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
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

  const startAt = useCallback((index: number) => {
    cleanup();
    setCurrentIndex(index);
    setStatus('loading');
    loadStartRef.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      const nf = new Set(failedRef.current);
      nf.add(index);
      failedRef.current = nf;
      setFailedIndices(new Set(nf));
      tryNextFrom(index, nf);
    }, LOAD_TIMEOUT);
  }, [cleanup, tryNextFrom]);

  const handleLoad = useCallback(() => {
    const loadTime = Date.now() - loadStartRef.current;
    const idx = currentIndexRef.current;

    if (loadTime < FAST_LOAD_THRESHOLD) {
      const p = iframeProviders[idx];
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
    const p = iframeProviders[idx];
    if (p) {
      trackProviderEvent(p.name, true, loadTime);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: p.name, index: idx, timestamp: Date.now() }));
      } catch {}
    }
    onFullscreenRef.current?.();
  }, [iframeProviders, tryNextFrom, cleanup]);

  const handleError = useCallback(() => {
    cleanup();
    const idx = currentIndexRef.current;
    const p = iframeProviders[idx];
    if (p) trackProviderEvent(p.name, false, Date.now() - loadStartRef.current);
    const nf = new Set(failedRef.current);
    nf.add(idx);
    failedRef.current = nf;
    setFailedIndices(new Set(nf));
    tryNextFrom(idx, nf);
  }, [iframeProviders, tryNextFrom, cleanup]);

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
        const idx = iframeProviders.findIndex(p => p.name === name);
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
  }, [cleanup, iframeProviders, tryNextFrom]);

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

  useEffect(() => {
    if (iframeProviders.length === 0) return;
    switchToAuto();
    return () => cleanup();
  }, [tmdbId, animeId, mediaType]);

  const activeProvider = currentIndex >= 0 ? iframeProviders[currentIndex] : null;
  const activeUrl = activeProvider ? activeProvider.url : '';

  const showEpisodeUI = isAnime || isTV;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
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

      {(status === 'loading' || status === 'idle') && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 z-10 pointer-events-none">
          <div className="text-center">
            <div className="relative w-10 h-10 mx-auto mb-3">
              <div className="absolute inset-0 border-2 border-red-600/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-red-600 rounded-full animate-spin" />
            </div>
            <p className="text-zinc-500 text-xs">
              {mode === 'auto' ? 'جاري تجربة السيرفر...' : 'جاري التحميل...'}
            </p>
            {activeProvider && (
              <p className="text-zinc-700 text-[10px] mt-1">{activeProvider.name}</p>
            )}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95 backdrop-blur z-10">
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-zinc-300 font-semibold text-sm mb-1">جميع السيرفرات غير متاحة</p>
            <p className="text-zinc-600 text-xs mb-4">جرب مرة أخرى أو اختر سيرفر يدوياً</p>
            <button onClick={switchToAuto} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-all">
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Server selector — TOP RIGHT */}
      <div className="absolute top-3 right-3 z-20">
        <div className="relative">
          <button
            onClick={() => { setShowMenu(!showMenu); setShowEpisodeSelector(false); }}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 text-white text-xs font-medium hover:bg-black/90 transition-all min-h-[44px]"
          >
            {mode === 'auto' ? (
              <>
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>تلقائي</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span>{activeProvider?.name || 'المصدر'}</span>
              </>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {showMenu && (
            <div className="absolute top-full mt-2 right-0 w-56 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
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

              <div className="border-t border-white/5 px-3 py-1.5">
                <span className="text-[10px] text-zinc-600 font-medium">السيرفرات</span>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {iframeProviders.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => selectManual(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-all hover:bg-white/5 ${
                      currentIndex === i && mode === 'manual' ? 'text-white bg-white/5' : 'text-zinc-500'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      currentIndex === i && status === 'playing' ? 'bg-green-400' :
                      currentIndex === i && status === 'loading' ? 'bg-yellow-400 animate-pulse' :
                      failedIndices.has(i) ? 'bg-red-400/50' : 'bg-zinc-700'
                    }`} />
                    <span className="font-medium">{p.name}</span>
                    {currentIndex === i && mode === 'manual' && (
                      <Check className="w-3 h-3 mr-auto text-green-400" />
                    )}
                    {p.brandColor && (
                      <span className="w-1.5 h-1.5 rounded-full ml-auto" style={{ backgroundColor: p.brandColor }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Episode/Season selector — TOP LEFT */}
      {showEpisodeUI && (
        <div className="absolute top-3 left-3 z-20">
          <div className="relative">
            <button
              onClick={() => { setShowEpisodeSelector(!showEpisodeSelector); setShowMenu(false); }}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 text-white text-xs font-medium hover:bg-black/90 transition-all min-h-[44px]"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {isAnime ? `الحلقة ${currentEpisode}` : `S${currentSeason} E${currentEpisode}`}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showEpisodeSelector ? 'rotate-180' : ''}`} />
            </button>

            {showEpisodeSelector && (
              <div className="absolute top-full mt-2 left-0 w-72 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
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
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
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
                <div className="max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-5 gap-1.5 p-3">
                    {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(e => (
                      <button
                        key={e}
                        onClick={() => handleEpisodeChange(e)}
                        className={`min-h-[36px] min-w-[36px] rounded-lg text-xs font-semibold transition-all ${
                          e === currentEpisode
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
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
        </div>
      )}

      {/* Fullscreen button — BOTTOM CENTER */}
      {status === 'playing' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={handleFullscreen}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 text-white text-xs font-medium hover:bg-black/90 transition-all active:scale-95 min-h-[44px]"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>ملء الشاشة</span>
          </button>
        </div>
      )}

      {/* Auto mode progress — BOTTOM LEFT (small) */}
      {mode === 'auto' && status === 'loading' && (
        <div className="absolute bottom-3 left-3 z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
            <span className="text-yellow-400 text-[10px] font-medium">
              {failedIndices.size + 1} / {iframeProviders.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
