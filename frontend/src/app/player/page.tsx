'use client';

import AuthGuard from '@/components/AuthGuard';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { getMovieDetails } from '@/lib/api';
import { getProviders } from '@/lib/providers';
import { getProviderPerf, getProviderScore, trackProviderEvent, getBestProviderIndex } from '@/lib/providerPerf';
import MovieCard from '@/components/MovieCard';
import { ArrowLeft, Star, Calendar, Clock, ThumbsUp, Server, Film, Wifi, Layers } from 'lucide-react';

const embedDomains = ['embed', 'vidsrc', 'vidlink', 'multiembed', 'xpass', 'screenscape', 'vidplays', 'modocine', 'vidcore', 'apiplayer', '2embed', 'vidfast', 'videasy', 'smashystream', 'frembed', 'vidking', 'vidnest', 'vidrift', 'vidlove', 'cinemana', 'hd1', 'anime3rb'];

const qualityRank: Record<string, number> = { '360p': 0, '480p': 1, '720p': 2, '1080p': 3, '2K': 4, '4K': 5 };

const providerPerformance = getProviderPerf();

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tmdbId = searchParams.get('tmdb_id');
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<number | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const [autoTrying, setAutoTrying] = useState(false);
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadStartTime = useRef<number>(0);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Block popup ads from iframes
  useEffect(() => {
    const origOpen = window.open;
    const origCreateElement = document.createElement.bind(document);
    window.open = () => null;
    return () => { window.open = origOpen; };
  }, []);
  const mediaType = searchParams.get('type') || 'movie';
  const ref = searchParams.get('ref') || 'netflix';
  const providers = getProviders(tmdbId || '', mediaType);
  const qualities = movie?.links
    ?.filter((l: any) => l.embed_url && l.embed_url.startsWith('http'))
    .map((l: any) => ({ label: l.quality || '720p', url: l.embed_url, source: l.source || '' }))
    .sort((a: any, b: any) => (qualityRank[b.label] || 0) - (qualityRank[a.label] || 0))
    .filter((v: any, i: number, a: any[]) => a.findIndex((x: any) => x.url === v.url) === i) || [];

  useEffect(() => {
    if (!tmdbId) { setLoading(false); return; }
    setLoading(true);
    getMovieDetails(tmdbId)
      .then((data) => setMovie(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [tmdbId]);

  const startProvider = useCallback((index: number) => {
    if (index < 0 || index >= providers.length) return;
    setCurrentProvider(index);
    setIframeError(false);
    setResolvedUrl(null);
    setSelectedQuality(null);
    setAutoTrying(false);
    loadStartTime.current = Date.now();
    const p = providers[index];
    if (p?.needsResolution) {
      setResolving(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      fetch(`${apiBase}/api/movies/resolve-provider/${tmdbId}?provider=${p.name.toLowerCase()}`)
        .then(r => r.json())
        .then(data => { setResolvedUrl(data.url); setResolving(false); })
        .catch(() => { setResolvedUrl(null); setResolving(false); if (p) trackProviderEvent(p.name, false); setIframeError(true); });
    }
  }, [providers, tmdbId]);

  useEffect(() => {
    if (!tmdbId || loading) return;
    if (providers.length === 0) return;
    const best = getBestProviderIndex(providers);
    if (best >= 0) startProvider(best);
  }, [tmdbId, loading, providers.length]);

  const handleIframeError = useCallback(() => {
    if (!providers.length || currentProvider === null) return;
    const p = providers[currentProvider];
    if (p) trackProviderEvent(p.name, false, Date.now() - loadStartTime.current);
    setIframeError(true);
    const nextIdx = currentProvider + 1;
    if (nextIdx < providers.length) {
      setAutoTrying(true);
      autoTimerRef.current = setTimeout(() => startProvider(nextIdx), 2000);
    }
  }, [providers, currentProvider, startProvider]);

  const requestFullscreen = useCallback(() => {
    const el = playerContainerRef.current;
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (resolvedUrl && currentProvider !== null) requestFullscreen();
  }, [resolvedUrl, currentProvider, requestFullscreen]);

  const handleIframeLoad = useCallback(() => {
    if (currentProvider === null) return;
    const p = providers[currentProvider];
    if (p) trackProviderEvent(p.name, true, Date.now() - loadStartTime.current);
    requestFullscreen();
  }, [providers, currentProvider, requestFullscreen]);

  useEffect(() => {
    return () => { if (autoTimerRef.current) clearTimeout(autoTimerRef.current); };
  }, []);

  const switchProvider = useCallback((index: number) => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setAutoTrying(false);
    startProvider(index);
  }, [startProvider]);

  const getActiveUrl = () => {
    if (selectedQuality) {
      const q = qualities.find((q: any) => q.label === selectedQuality);
      if (q) return q.url;
    }
    if (currentProvider !== null) {
      const p = providers[currentProvider];
      if (p?.needsResolution) return resolvedUrl || '';
      return p?.url || '';
    }
    return qualities[0]?.url || '';
  };

  const ensureArabicSubs = (url: string) => {
    if (!url || url.includes('sub=')) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}sub=ar`;
  };

  const activeUrl = getActiveUrl();
  const isEmbed = !selectedQuality && embedDomains.some(d => activeUrl.includes(d));

  if (!tmdbId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center">
            <Film className="w-10 h-10 text-zinc-600" />
          </div>
          <p className="text-zinc-500 text-lg mb-2 font-medium">لم يتم اختيار فيلم</p>
          <p className="text-zinc-700 text-sm mb-8">اختر فيلماً للبدء في المشاهدة</p>
          <button onClick={() => router.push('/netflix')} className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg shadow-red-600/20 hover:shadow-red-600/40">
            تصفح الأفلام
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => router.push(`/${ref}`)} className="flex items-center gap-2.5 text-zinc-500 hover:text-white transition-all duration-200 group">
            <div className="w-8 h-8 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center group-hover:bg-zinc-800 transition">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm hidden sm:inline">رجوع</span>
          </button>
          <h1 className="text-sm font-medium text-zinc-300 truncate max-w-[300px] sm:max-w-md lg:max-w-lg">
            {movie?.title || ''}
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <div className="flex-1 min-w-0">
            <div ref={playerContainerRef} className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/[0.03]">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                      <div className="absolute inset-0 border-3 border-red-600/20 rounded-full" />
                      <div className="absolute inset-0 border-3 border-transparent border-t-red-600 rounded-full animate-spin" />
                    </div>
                    <p className="text-zinc-500 text-sm">جاري التحميل...</p>
                  </div>
                </div>
              ) : iframeError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95 backdrop-blur">
                  <div className="text-center px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Wifi className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-zinc-300 font-bold text-lg mb-1">المشغل غير متاح</p>
                    <p className="text-zinc-600 text-sm mb-6">جاري تجربة السيرفر التالي...</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {providers.slice(0, 6).map((p: any, i) => (
                        <button key={p.name} onClick={() => switchProvider(i)} className={`px-5 py-2.5 rounded-xl text-xs transition-all border ${currentProvider === i ? 'bg-red-600 text-white border-red-500' : 'bg-white/5 hover:bg-white/10 hover:text-white text-zinc-400 border-white/[0.03]'}`}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : resolving ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95 backdrop-blur">
                  <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                      <div className="absolute inset-0 border-3 border-red-600/20 rounded-full" />
                      <div className="absolute inset-0 border-3 border-transparent border-t-red-600 rounded-full animate-spin" />
                    </div>
                    <p className="text-zinc-400 text-sm">جاري البحث عن الرابط...</p>
                  </div>
                </div>
              ) : activeUrl ? (
                isEmbed ? (
                  <iframe
                    src={ensureArabicSubs(activeUrl)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                  />
                ) : (
                  <video
                    src={activeUrl}
                    className="w-full h-full object-contain bg-black"
                    controls
                    autoPlay
                    playsInline
                    poster={movie?.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : undefined}
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95 backdrop-blur">
                  <div className="text-center px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-center">
                      <Wifi className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-400 font-medium mb-1">لا توجد روابط متاحة</p>
                    <p className="text-zinc-600 text-xs">هذا المحتوى قد لا يكون متاحاً في الوقت الحالي</p>
                  </div>
                </div>
              )}
            </div>

            {qualities.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">جودة البث</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {qualities.map((q: any) => (
                    <button
                      key={q.label}
                      onClick={() => { setSelectedQuality(q.label); setCurrentProvider(null); setIframeError(false); }}
                      className={`relative px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                        selectedQuality === q.label
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20 ring-1 ring-red-400/30 scale-105'
                          : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-white/[0.03]'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              {error ? (
                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm text-center">
                  تعذر تحميل معلومات الفيلم. تأكد من معرف TMDB.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">اختر السيرفر</span>
                    {autoTrying && (
                      <span className="text-xs text-zinc-600 animate-pulse">(جاري تجربة السيرفر التالي...)</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {providers.map((p: any, i) => {
                      const perf = providerPerformance[p.name];
                      const pScore = perf && perf.events.length >= 3 ? Math.round(getProviderScore(perf)) : null;
                      const pBadge = pScore !== null ? (pScore >= 8 ? 'bg-emerald-500' : pScore >= 5 ? 'bg-yellow-500' : 'bg-red-500') : null;
                      return (
                        <button
                          key={p.name}
                          onClick={() => switchProvider(i)}
                          className={`relative px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                            currentProvider === i && !selectedQuality
                              ? p.brandColor
                                ? 'text-white font-bold shadow-lg scale-105'
                                : 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20 ring-1 ring-red-400/30'
                              : p.brandColor
                                ? 'text-white/90 hover:text-white border border-white/20'
                                : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-white/[0.03] hover:border-white/10'
                          }`}
                          style={p.brandColor ? {
                            background: currentProvider === i && !selectedQuality
                              ? `linear-gradient(135deg, ${p.brandColor}dd, ${p.brandColor}88)`
                              : `linear-gradient(135deg, ${p.brandColor}22, ${p.brandColor}11)`,
                            borderColor: currentProvider === i && !selectedQuality ? p.brandColor : `${p.brandColor}44`,
                            boxShadow: currentProvider === i && !selectedQuality
                              ? `0 0 20px ${p.brandColor}44, 0 0 40px ${p.brandColor}22`
                              : `0 0 8px ${p.brandColor}11`,
                          } : undefined}
                        >
                          {p.brandColor ? (
                            <span className="flex items-center gap-1.5">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full animate-ping`} style={{ backgroundColor: p.brandColor }} />
                              {p.displayName}
                            </span>
                          ) : (
                            <span>{p.name}</span>
                          )}
                          {pBadge && !p.brandColor && (
                            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${pBadge} ring-2 ring-[#0a0a0a]`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 lg:hidden">
              <MovieInfo movie={movie} />
            </div>
          </div>

          <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <MovieInfo movie={movie} />
              {movie?.similar && movie.similar.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Film className="w-4 h-4 text-red-500" />
                    مقترحات
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {movie.similar.slice(0, 6).map((m: any) => (
                      <MovieCard key={m.tmdb_id || m.id} movie={m} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MovieInfo({ movie }: { movie: any }) {
  if (!movie) return null;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-white leading-tight">{movie.title}</h1>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {movie.release_date && (
          <span className="flex items-center gap-1.5 text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-xl border border-white/[0.03]">
            <Calendar className="w-3.5 h-3.5" />
            {movie.release_date.slice(0, 4)}
          </span>
        )}
        {movie.vote_average && (
          <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/5 px-3 py-1.5 rounded-xl border border-yellow-500/10">
            <Star className="w-3.5 h-3.5 fill-yellow-500" />
            {movie.vote_average.toFixed(1)}
          </span>
        )}
        {movie.runtime && (
          <span className="flex items-center gap-1.5 text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-xl border border-white/[0.03]">
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
          </span>
        )}
        {movie.vote_count && (
          <span className="flex items-center gap-1.5 text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-xl border border-white/[0.03]">
            <ThumbsUp className="w-3.5 h-3.5" />
            {movie.vote_count.toLocaleString()}
          </span>
        )}
      </div>
      {movie.genres && movie.genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {movie.genres.slice(0, 5).map((g: any) => (
            <span key={g.id} className="px-3 py-1.5 rounded-xl bg-zinc-900/80 text-zinc-400 text-[10px] font-medium border border-white/[0.03] cursor-default">
              {g.name}
            </span>
          ))}
        </div>
      )}
      {movie.overview && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">القصة</h3>
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-6 bg-zinc-900/30 rounded-2xl p-4 border border-white/[0.02]">
            {movie.overview}
          </p>
        </div>
      )}
    </div>
  );
}

export default function PlayerPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-red-600/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin" />
            </div>
            <p className="text-zinc-500 text-sm">جاري التجهيز...</p>
          </div>
        </div>
      }>
        <PlayerContent />
      </Suspense>
    </AuthGuard>
  );
}
