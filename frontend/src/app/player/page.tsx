'use client';

import AuthGuard from '@/components/AuthGuard';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { getMovieDetails } from '@/lib/api';
import { getProviders } from '@/lib/providers';
import MovieCard from '@/components/MovieCard';
import { ArrowLeft, Star, Calendar, Tv, RefreshCw, Server, Film, Search, Monitor, Shield, Wifi, Globe, Hash, Clock, Eye, ThumbsUp, Layers } from 'lucide-react';

interface MovieData {
  tmdb_id: string;
  title: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  links?: { embed_url: string; quality?: string; source?: string }[];
  category?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  similar?: any[];
}

const qualityRank: Record<string, number> = { '360p': 0, '480p': 1, '720p': 2, '1080p': 3, '2K': 4, '4K': 5 };

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tmdbId = searchParams.get('tmdb_id');
  const serverParam = searchParams.get('server');
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<number | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const mediaType = searchParams.get('type') || 'movie';
  const [iframeError, setIframeError] = useState(false);

  const providers = getProviders(tmdbId || '', mediaType);
  const qualities = movie?.links
    ?.filter(l => l.embed_url && l.embed_url.startsWith('http'))
    .map(l => ({ label: l.quality || '720p', url: l.embed_url, source: l.source || '' }))
    .sort((a, b) => (qualityRank[b.label] || 0) - (qualityRank[a.label] || 0))
    .filter((v, i, a) => a.findIndex(x => x.url === v.url) === i) || [];

  useEffect(() => {
    if (!tmdbId) { setLoading(false); return; }
    getMovieDetails(tmdbId)
      .then((data) => setMovie(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [tmdbId]);

  useEffect(() => {
    if (serverParam) {
      const idx = providers.findIndex((p: any) => p.name.toLowerCase() === serverParam.toLowerCase());
      if (idx >= 0) { setCurrentProvider(idx); setSelectedQuality(null); }
    }
  }, [serverParam]);

  useEffect(() => {
    if (!tmdbId || currentProvider === null || currentProvider >= providers.length) return;
    const p = providers[currentProvider] as any;
    if (p?.needsResolution) {
      setResolvedUrl(null);
      setResolving(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      fetch(`${apiBase}/api/movies/resolve-provider/${tmdbId}?provider=${p.name.toLowerCase()}`)
        .then(r => r.json())
        .then(data => { setResolvedUrl(data.url); setResolving(false); })
        .catch(() => { setResolvedUrl(null); setResolving(false); });
    } else {
      setResolvedUrl(null);
    }
  }, [currentProvider, tmdbId]);

  const switchProvider = useCallback((index: number | null) => {
    setCurrentProvider(index);
    setIframeError(false);
    setResolvedUrl(null);
    if (index !== null) {
      const name = providers[index]?.name?.toLowerCase();
      const params = new URLSearchParams(searchParams.toString());
      params.set('server', name);
      router.replace(`/player?${params.toString()}`, { scroll: false });
    }
  }, [providers, searchParams, router]);

  const getActiveUrl = () => {
    if (selectedQuality) {
      const q = qualities.find(q => q.label === selectedQuality);
      if (q) return q.url;
    }
    if (currentProvider !== null) {
      const p = providers[currentProvider] as any;
      if (p?.needsResolution) return resolvedUrl || '';
      return p?.url || '';
    }
    return qualities[0]?.url || '';
  };

  const activeUrl = getActiveUrl();
  const isEmbed = !selectedQuality && (activeUrl.includes('embed') || activeUrl.includes('vidsrc') || activeUrl.includes('vidlink') || activeUrl.includes('xpass') || activeUrl.includes('vidcore') || activeUrl.includes('apiplayer') || activeUrl.includes('2embed') || activeUrl.includes('vidfast') || activeUrl.includes('videasy') || activeUrl.includes('smashystream') || activeUrl.includes('frembed') || activeUrl.includes('vidking') || activeUrl.includes('vidnest') || activeUrl.includes('vidrift') || activeUrl.includes('vidlove') || activeUrl.includes('cinemana') || activeUrl.includes('hd1') || activeUrl.includes('anime3rb'));

  if (!tmdbId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0e0e0e] to-[#0a0a0a] flex items-center justify-center">
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0e0e0e] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-red-600/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin" />
          </div>
          <p className="text-zinc-400 text-sm">جاري تحميل معلومات الفيلم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0e0e0e] to-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2.5 text-zinc-500 hover:text-white transition-all duration-200 group">
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

      {/* Main Layout */}
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* Left: Player */}
          <div className="flex-1 min-w-0">
            {/* Player Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/[0.03]">
              {iframeError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95 backdrop-blur">
                  <div className="text-center px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-zinc-300 font-bold text-lg mb-1">المشغل غير متاح</p>
                    <p className="text-zinc-600 text-sm mb-6">قد يكون هذا السيرفر معطلاً حالياً، جرب سيرفر آخر</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {providers.slice(0, 4).map((p: any, i) => (
                        <button key={p.name} onClick={() => switchProvider(i)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl text-xs text-zinc-400 transition-all border border-white/[0.03]">
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : resolving ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95 backdrop-blur">
                  <div className="text-center">
                    <Search className="w-8 h-8 text-zinc-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-zinc-400 text-sm">جاري البحث عن الرابط...</p>
                    <div className="flex gap-1 justify-center mt-4">
                      <span className="w-2 h-2 rounded-full bg-red-600/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-red-600/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-red-600/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              ) : activeUrl ? (
                isEmbed ? (
                  <iframe
                    src={activeUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    onError={() => setIframeError(true)}
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

            {/* Quality Selection (from scraped links) */}
            {qualities.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">جودة البث</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {qualities.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => { setSelectedQuality(q.label); setCurrentProvider(null); setIframeError(false); }}
                      className={`relative px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                        selectedQuality === q.label
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20 ring-1 ring-red-400/30 scale-105'
                          : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-white/[0.03] hover:scale-102'
                      }`}
                    >
                      <Hash className="w-3 h-3 inline mr-1.5 opacity-70" />
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Provider Selection */}
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
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {providers.map((p: any, i) => (
                      <button
                        key={p.name}
                        onClick={() => switchProvider(i)}
                        className={`relative px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                          currentProvider === i && !selectedQuality
                            ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20 ring-1 ring-red-400/30'
                            : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-white/[0.03] hover:border-white/10'
                        }`}
                      >
                        <Globe className={`w-3 h-3 inline mr-1.5 ${currentProvider === i && !selectedQuality ? 'text-red-200' : 'text-zinc-600'}`} />
                        {p.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Movie Info - Mobile */}
            <div className="mt-8 lg:hidden">
              <MovieInfo movie={movie} />
            </div>

            {/* Similar - Mobile */}
            {movie?.similar && movie.similar.length > 0 && (
              <div className="mt-10 lg:hidden">
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-500" />
                  مقترحات
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
                  {movie.similar.slice(0, 10).map((m: any) => (
                    <div key={m.tmdb_id || m.id} className="snap-start shrink-0 w-[140px]">
                      <MovieCard movie={m} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Movie Info Sidebar - Desktop */}
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

function MovieInfo({ movie }: { movie: MovieData | null }) {
  if (!movie) return null;
  return (
    <div className="space-y-5">
      {/* Title */}
      <h1 className="text-2xl font-black text-white leading-tight">{movie.title}</h1>

      {/* Meta */}
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

      {/* Genres */}
      {movie.genres && movie.genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {movie.genres.slice(0, 5).map((g) => (
            <span key={g.id} className="px-3 py-1.5 rounded-xl bg-zinc-900/80 text-zinc-400 text-[10px] font-medium border border-white/[0.03] hover:bg-zinc-800 transition cursor-default">
              {g.name}
            </span>
          ))}
        </div>
      )}

      {/* Overview */}
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
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0e0e0e] to-[#0a0a0a] flex items-center justify-center">
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
