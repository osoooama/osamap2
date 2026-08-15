'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, ThumbsUp, ChevronDown, Zap, Check, AlertCircle, Layers, Maximize2, Subtitles, Tv, MonitorPlay } from 'lucide-react';
import { getTMDBTrailer, getMovieDetails, getSubtitles, type Subtitle } from '@/lib/api';
import { getProviders } from '@/lib/providers';
import { trackProviderEvent } from '@/lib/providerPerf';
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
  const perf = typeof window !== 'undefined' ? (() => { try { return JSON.parse(localStorage.getItem('osk_provider_perf') || '{}'); } catch { return {}; } })() : {};
  const p = perf[name];
  if (!p || p.events?.length < 2) return 'unknown';
  const recent = p.events.slice(-5);
  const sr = recent.filter((e: any) => e.success).length / recent.length;
  if (sr < 0.3) return 'bad';
  if (sr < 0.7) return 'slow';
  return 'good';
}

export default function NetflixModal({ visible, onClose, movie, accentColor = '#E50914', platformRef = 'netflix' }: NetflixModalProps) {
  const tmdbId = movie?.tmdb_id;
  const mediaType = movie?.media_type || 'movie';
  const isTV = mediaType === 'tv';

  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fullDetails, setFullDetails] = useState<any>(null);

  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(24);

  const [providers, setProviders] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [playStatus, setPlayStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [showServers, setShowServers] = useState(false);
  const [showEps, setShowEps] = useState(false);
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const [subs, setSubs] = useState<Subtitle[]>([]);
  const [selSub, setSelSub] = useState<Subtitle | null>(null);
  const [showSubs, setShowSubs] = useState(false);

  const failedRef = useRef(new Set<number>());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const loadStart = useRef<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const backdropUrl = movie?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null;
  const matchPct = movie?.vote_average ? Math.round(movie.vote_average * 10) : 0;
  const year = movie?.release_date ? movie.release_date.slice(0, 4) : null;

  useEffect(() => {
    if (!tmdbId || !visible) return;
    getTMDBTrailer(tmdbId, mediaType as 'movie' | 'tv').then(setTrailerKey).catch(() => {});
  }, [tmdbId, mediaType, visible]);

  useEffect(() => {
    if (!tmdbId || !visible) return;
    getMovieDetails(tmdbId).then(d => {
      if (d) {
        setFullDetails(d);
        const seasons = d.seasons;
        if (Array.isArray(seasons)) {
          setTotalSeasons(seasons.length);
          const ep = seasons.find((s: Record<string, unknown>) => s.season_number === currentSeason);
          if (ep) setTotalEpisodes(ep.episode_count as number);
        }
      }
    }).catch(() => {});
  }, [tmdbId, visible]);

  useEffect(() => {
    if (!tmdbId) return;
    try { setIsFav(JSON.parse(localStorage.getItem('osk_favorites') || '[]').some((f: any) => f.tmdb_id === tmdbId)); } catch {}
  }, [tmdbId]);

  const toggleFav = useCallback(() => {
    if (!tmdbId || !movie) return;
    try {
      let favs = JSON.parse(localStorage.getItem('osk_favorites') || '[]');
      favs = isFav ? favs.filter((f: any) => f.tmdb_id !== tmdbId) : [...favs, { tmdb_id: tmdbId, title: movie.title, poster: movie.poster_path, media_type: mediaType, backdrop_path: movie.backdrop_path, vote_average: movie.vote_average, release_date: movie.release_date, genres: movie.genres, overview: movie.overview }];
      localStorage.setItem('osk_favorites', JSON.stringify(favs));
      setIsFav(!isFav);
    } catch {}
  }, [tmdbId, movie, isFav, mediaType]);

  const cleanup = useCallback(() => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } }, []);

  const currentProviders = useMemo(() => {
    if (!tmdbId) return [];
    const cat = platformRef === 'shahid' ? 'arabic' : platformRef === 'disney' ? 'animation' : platformRef === 'crunchyroll' ? 'anime' : 'foreign';
    return getProviders(tmdbId, mediaType, currentSeason, currentEpisode, platformRef as any)
      .filter((p: any) => cat === 'foreign' ? (p.category === 'foreign' || p.category === 'all') : (p.category === cat || p.category === 'all'));
  }, [tmdbId, mediaType, currentSeason, currentEpisode, platformRef]);

  const [scraped, setScraped] = useState<any[]>([]);
  useEffect(() => {
    if (!playing || !tmdbId) return;
    const toResolve = currentProviders.filter((p: any) => p.needsResolution);
    if (!toResolve.length) { setScraped([]); return; }
    (async () => {
      const r: any[] = [];
      for (const p of toResolve) {
        try {
          const u = String(p.url);
          const full = u.startsWith('http') ? u : `${process.env.NEXT_PUBLIC_API_URL || 'https://osamap2.onrender.com'}${u}`;
          const resp = await fetch(full, { signal: AbortSignal.timeout(5000) });
          if (!resp.ok) continue;
          const d = await resp.json();
          if (d.streams) d.streams.forEach((s: any) => r.push({ ...p, name: `${p.name} (${s.quality})`, displayName: `${p.displayName} ${s.quality}`, url: s.url, needsResolution: false }));
        } catch {}
      }
      setScraped(r);
    })();
  }, [playing, tmdbId, currentSeason, currentEpisode, currentProviders]);

  const allP = useMemo(() => [...scraped, ...currentProviders.filter((p: any) => !p.needsResolution)], [scraped, currentProviders]);
  const active = currentIdx >= 0 ? allP[currentIdx] : null;
  const activeUrl = active?.url || '';

  const tryNext = useCallback((fi: number, nf: Set<number>) => {
    for (let i = 0; i < allP.length; i++) {
      if (i !== fi && !nf.has(i)) {
        setCurrentIdx(i);
        setPlayStatus('loading');
        loadStart.current = Date.now();
        cleanup();
        timerRef.current = setTimeout(() => { const n = new Set(failedRef.current); n.add(i); failedRef.current = n; setFailed(new Set(n)); tryNext(i, n); }, LOAD_TIMEOUT);
        return;
      }
    }
    setPlayStatus('error');
  }, [allP.length, cleanup]);

  const startPlay = useCallback(() => {
    cleanup();
    failedRef.current = new Set();
    setFailed(new Set());
    let si = 0;
    try { const c = localStorage.getItem(STORAGE_KEY); if (c) { const idx = allP.findIndex(p => p.name === JSON.parse(c).name); if (idx >= 0) si = idx; } } catch {}
    setCurrentIdx(si);
    setPlayStatus('loading');
    loadStart.current = Date.now();
    timerRef.current = setTimeout(() => { const n = new Set<number>(); n.add(si); failedRef.current = n; setFailed(new Set(n)); tryNext(si, n); }, LOAD_TIMEOUT);
  }, [allP, cleanup, tryNext]);

  const selectServer = useCallback((i: number) => {
    cleanup();
    failedRef.current = new Set();
    setFailed(new Set());
    setCurrentIdx(i);
    setPlayStatus('loading');
    loadStart.current = Date.now();
    timerRef.current = setTimeout(() => setPlayStatus('error'), LOAD_TIMEOUT);
    setShowServers(false);
  }, [cleanup]);

  useEffect(() => {
    if (playing && allP.length > 0) startPlay();
    return () => cleanup();
  }, [playing, allP.length, currentSeason, currentEpisode]);

  useEffect(() => {
    if (playing && tmdbId) getSubtitles(tmdbId, mediaType, currentSeason, currentEpisode).then(setSubs).catch(() => setSubs([]));
  }, [playing, tmdbId, mediaType, currentSeason, currentEpisode]);

  const onLoad = useCallback(() => {
    const t = Date.now() - loadStart.current;
    if (t < FAST_LOAD_THRESHOLD) { const n = new Set(failedRef.current); n.add(currentIdx); failedRef.current = n; setFailed(new Set(n)); tryNext(currentIdx, n); return; }
    cleanup();
    setPlayStatus('playing');
    const p = allP[currentIdx];
    if (p) { trackProviderEvent(p.name, true, t); try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: p.name })); } catch {} }
  }, [currentIdx, allP, cleanup, tryNext]);

  const onError = useCallback(() => {
    cleanup();
    const p = allP[currentIdx];
    if (p) trackProviderEvent(p.name, false, Date.now() - loadStart.current);
    const n = new Set(failedRef.current); n.add(currentIdx); failedRef.current = n; setFailed(new Set(n));
    tryNext(currentIdx, n);
  }, [currentIdx, allP, cleanup, tryNext]);

  const changeSeason = useCallback((s: number) => {
    setCurrentSeason(s);
    setCurrentEpisode(1);
    setShowEps(false);
    failedRef.current = new Set();
    setFailed(new Set());
    cleanup();
    const ep = fullDetails?.seasons?.find((se: any) => se.season_number === s);
    if (ep) setTotalEpisodes(ep.episode_count);
  }, [fullDetails, cleanup]);

  const changeEpisode = useCallback((e: number) => {
    setCurrentEpisode(e);
    setShowEps(false);
    failedRef.current = new Set();
    setFailed(new Set());
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showServers) setShowServers(false);
        else if (showEps) setShowEps(false);
        else if (showSubs) setShowSubs(false);
        else if (playing) setPlaying(false);
        else onClose();
      }
    };
    if (visible) { document.addEventListener('keydown', h); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [visible, onClose, playing, showServers, showEps, showSubs]);

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (showServers) setShowServers(false);
      else if (showEps) setShowEps(false);
      else onClose();
    }
  };

  return (
    <AnimatePresence>
      {visible && movie && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/90 backdrop-blur-sm overflow-y-auto py-4 sm:py-8 px-2 sm:px-4"
          onClick={onBackdrop}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl bg-[#141414] rounded-xl overflow-hidden shadow-2xl shadow-black/80"
          >
            {/* Close */}
            <button
              onClick={() => playing ? setPlaying(false) : onClose()}
              className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-[#181818]/80 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-[#333] transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* ═══ INFO STATE ═══ */}
            {!playing && (
              <div className="relative w-full aspect-video bg-black">
                {trailerKey ? (
                  <div className="relative w-full h-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
                  </div>
                ) : backdropUrl ? (
                  <>
                    <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <span className="text-3xl font-black text-zinc-800">OSK+</span>
                  </div>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-4 left-5 right-16 pointer-events-none">
                  <div className="flex items-center gap-2 mb-1">
                    {platformRef === 'disney' ? (
                      <>
                        <div className="w-6 h-6 rounded overflow-hidden ring-1 ring-blue-500/30 bg-gradient-to-br from-[#0063E5] to-[#003399] flex items-center justify-center">
                          <span className="text-white font-black text-[8px]">D+</span>
                        </div>
                        <span className="text-[#0063E5] text-[9px] font-bold tracking-wider">DISNEY+</span>
                      </>
                    ) : platformRef === 'crunchyroll' ? (
                      <>
                        <div className="w-6 h-6 rounded overflow-hidden ring-1 ring-orange-500/30 bg-[#F47521] flex items-center justify-center">
                          <span className="text-white font-black text-[8px]">CR</span>
                        </div>
                        <span className="text-[#F47521] text-[9px] font-bold tracking-wider">CRUNCHYROLL</span>
                      </>
                    ) : platformRef === 'shahid' ? (
                      <>
                        <div className="w-6 h-6 rounded overflow-hidden ring-1 ring-green-500/30 bg-[#00C853] flex items-center justify-center">
                          <span className="text-white font-black text-[8px]">ش</span>
                        </div>
                        <span className="text-[#00C853] text-[9px] font-bold tracking-wider">SHAHID</span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded overflow-hidden ring-1 ring-red-500/30">
                          <Image src="/netflix.webp" alt="" width={24} height={24} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-red-500 text-[9px] font-bold tracking-wider">NETFLIX</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white drop-shadow-2xl leading-tight">{movie.title}</h2>
                </div>
              </div>
            )}

            {/* Info content */}
            {!playing && (
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlaying(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110 active:scale-95 shadow-lg"
                    style={{ backgroundColor: accentColor, boxShadow: `0 4px 16px ${accentColor}40` }}
                  >
                    <Play className="w-4 h-4 fill-white" />
                    شاهد الآن
                  </button>
                  <button onClick={toggleFav} className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${isFav ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}`}>
                    <Plus className={`w-4 h-4 transition-transform ${isFav ? 'rotate-45' : ''}`} />
                  </button>
                  <button className="w-9 h-9 rounded-full border-2 bg-white/5 border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-all hover:scale-110">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                  {matchPct > 0 && <span className="text-emerald-400 font-bold">{matchPct}% Match</span>}
                  {year && <span className="text-zinc-400">{year}</span>}
                  {movie.runtime && <span className="text-zinc-400">{Math.floor(movie.runtime / 60)} س {movie.runtime % 60} د</span>}
                  <span className="px-1.5 py-0.5 rounded border border-white/10 text-zinc-400 text-[9px] font-medium">HD</span>
                </div>
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {movie.genres.slice(0, 5).map(g => <span key={g.id} className="px-2 py-0.5 rounded text-[10px] sm:text-xs bg-white/5 text-zinc-400 border border-white/5">{g.name}</span>)}
                  </div>
                )}
                {movie.overview && <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">{movie.overview}</p>}
              </div>
            )}

            {/* ═══ PLAYER STATE ═══ */}
            {playing && (
              <div>
                {/* Video */}
                <div className="relative w-full aspect-video bg-black">
                  {activeUrl && (() => {
                    const isDirect = /\.(m3u8|mp4|mkv|webm)(\?|$)/i.test(activeUrl);
                    return isDirect ? (
                      <video key={`${currentIdx}-${currentSeason}-${currentEpisode}`} src={activeUrl} className="w-full h-full object-contain" style={{ opacity: playStatus === 'playing' ? 1 : 0, transition: 'opacity 0.3s' }} controls autoPlay onError={onError} />
                    ) : (
                      <iframe ref={iframeRef} key={`${currentIdx}-${currentSeason}-${currentEpisode}`} src={activeUrl} className="w-full h-full border-0" style={{ opacity: playStatus === 'playing' ? 1 : 0, transition: 'opacity 0.3s' }} allowFullScreen allow="autoplay; encrypted-media; fullscreen" onLoad={onLoad} onError={onError} />
                    );
                  })()}

                  {/* Loading */}
                  {(playStatus === 'loading' || playStatus === 'idle') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                      <div className="text-center">
                        <div className="relative w-8 h-8 mx-auto mb-2">
                          <div className="absolute inset-0 border-2 border-emerald-600/20 rounded-full" />
                          <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin" />
                        </div>
                        <p className="text-zinc-500 text-[11px]">{active?.displayName || 'جاري التحميل...'}</p>
                        <p className="text-zinc-700 text-[9px] mt-0.5">{failed.size + 1}/{allP.length}</p>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {playStatus === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-zinc-300 text-sm mb-3">جميع السيرفرات غير متاحة</p>
                        <button onClick={() => { failedRef.current = new Set(); setFailed(new Set()); startPlay(); }} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold">إعادة المحاولة</button>
                      </div>
                    </div>
                  )}

                  {/* Bottom bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-10 pb-2.5 px-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {isTV && totalSeasons > 1 && (
                          <div className="relative">
                            <button onClick={() => { setShowEps(!showEps); setShowServers(false); setShowSubs(false); }} className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-[10px] text-white hover:bg-white/20 transition">
                              <Layers className="w-3 h-3 text-purple-400" />
                              S{currentSeason} E{currentEpisode}
                              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showEps ? 'rotate-180' : ''}`} />
                            </button>
                            {showEps && (
                              <div className="absolute bottom-full mb-2 left-0 w-56 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                                <div className="px-3 py-1.5 border-b border-white/5"><span className="text-[9px] text-zinc-600 flex items-center gap-1"><Tv className="w-2.5 h-2.5" /> الموسم</span></div>
                                <div className="flex flex-wrap gap-1 p-2">{Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => <button key={s} onClick={() => changeSeason(s)} className={`min-w-[28px] h-7 rounded text-[10px] font-semibold ${s === currentSeason ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{s}</button>)}</div>
                                <div className="border-t border-white/5 px-3 py-1.5"><span className="text-[9px] text-zinc-600 flex items-center gap-1"><MonitorPlay className="w-2.5 h-2.5" /> الحلقات</span></div>
                                <div className="max-h-36 overflow-y-auto p-2 grid grid-cols-6 gap-1">{Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(e => <button key={e} onClick={() => changeEpisode(e)} className={`min-w-[24px] h-6 rounded text-[9px] font-semibold ${e === currentEpisode ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{e}</button>)}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {subs.length > 0 && (
                          <div className="relative">
                            <button onClick={() => { setShowSubs(!showSubs); setShowServers(false); setShowEps(false); }} className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-[10px] text-white hover:bg-white/20 transition">
                              <Subtitles className="w-3 h-3 text-cyan-400" />
                              <span className="hidden sm:inline">{selSub ? selSub.lang_name : 'ترجمة'}</span>
                            </button>
                            {showSubs && (
                              <div className="absolute bottom-full mb-2 right-0 w-44 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                                <button onClick={() => { setSelSub(null); setShowSubs(false); }} className={`w-full flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-white/5 ${!selSub ? 'text-cyan-400' : 'text-zinc-500'}`}>إيقاف {!selSub && <Check className="w-2.5 h-2.5 mr-auto" />}</button>
                                <div className="max-h-36 overflow-y-auto">{subs.map((s, i) => <button key={i} onClick={() => { setSelSub(s); setShowSubs(false); }} className={`w-full flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-white/5 ${selSub?.url === s.url ? 'text-cyan-400' : 'text-zinc-500'}`}>{s.flag_url && <img src={s.flag_url} alt="" className="w-3 h-2 rounded-sm" />}{s.lang_name}{selSub?.url === s.url && <Check className="w-2.5 h-2.5 mr-auto" />}</button>)}</div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="relative">
                          <button onClick={() => { setShowServers(!showServers); setShowEps(false); setShowSubs(false); }} className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-[10px] text-white hover:bg-white/20 transition">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            <span className="hidden sm:inline">{active?.displayName || 'سيرفر'}</span>
                            <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showServers ? 'rotate-180' : ''}`} />
                          </button>
                          {showServers && (
                            <div className="absolute bottom-full mb-2 right-0 w-52 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
                              <div className="px-3 py-1 border-b border-white/5 flex justify-between"><span className="text-[9px] text-zinc-600">السيرفرات</span><span className="text-[9px] text-zinc-700">{allP.length}</span></div>
                              <div className="max-h-48 overflow-y-auto">{allP.map((p, i) => {
                                const h = getServerHealth(p.name);
                                return <button key={p.name} onClick={() => selectServer(i)} className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition ${currentIdx === i ? 'text-white bg-white/5' : 'text-zinc-500'}`}>
                                  <div className={`w-2 h-2 rounded-full shrink-0 ${h === 'good' ? 'bg-green-400' : h === 'slow' ? 'bg-yellow-400' : h === 'bad' ? 'bg-red-400/50' : currentIdx === i && playStatus === 'playing' ? 'bg-green-400' : 'bg-zinc-700'}`} />
                                  <span className="truncate font-medium">{p.displayName || p.name}</span>
                                  {currentIdx === i && playStatus === 'playing' && <Check className="w-3 h-3 text-green-400 ml-auto" />}
                                </button>;
                              })}</div>
                            </div>
                          )}
                        </div>
                        <button onClick={() => { const el = iframeRef.current?.parentElement; if (el) { document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen().catch(() => {}); } }} className="flex items-center justify-center w-7 h-7 rounded bg-white/10 text-white hover:bg-white/20 transition">
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Movie info below player */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-[10px]">
                    {matchPct > 0 && <span className="text-emerald-400 font-bold">{matchPct}% Match</span>}
                    {year && <span className="text-zinc-500">{year}</span>}
                    {movie.runtime && <span className="text-zinc-500">{Math.floor(movie.runtime / 60)}س {movie.runtime % 60}د</span>}
                  </div>
                  {movie.overview && <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">{movie.overview}</p>}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
