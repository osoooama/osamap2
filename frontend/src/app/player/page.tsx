'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { getMovieDetails } from '@/lib/api';
import { getProvidersWithPriority } from '@/lib/providers';
import MovieCard from '@/components/MovieCard';
import { ArrowLeft, Star, Calendar, Tv, RefreshCw, Server, Film, BadgeCheck, Search } from 'lucide-react';

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

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tmdbId = searchParams.get('tmdb_id');
  const serverParam = searchParams.get('server');
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(0);
  const [resolving, setResolving] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const mediaType = searchParams.get('type') || 'movie';
  const [iframeError, setIframeError] = useState(false);

  const providers = getProvidersWithPriority(tmdbId || '', mediaType);

  const initialProvider = serverParam
    ? providers.findIndex((p) => p.name.toLowerCase() === serverParam.toLowerCase())
    : 0;

  useEffect(() => {
    if (!tmdbId) { setLoading(false); return; }
    getMovieDetails(tmdbId)
      .then((data) => setMovie(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [tmdbId]);

  useEffect(() => {
    if (initialProvider >= 0) setCurrentProvider(initialProvider);
  }, [serverParam]);

  useEffect(() => {
    if (!tmdbId || currentProvider >= providers.length) return;
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

  const switchServer = useCallback((index: number) => {
    setCurrentProvider(index);
    setIframeError(false);
    setResolvedUrl(null);
    const name = providers[index]?.name?.toLowerCase();
    const params = new URLSearchParams(searchParams.toString());
    params.set('server', name);
    router.replace(`/player?${params.toString()}`, { scroll: false });
  }, [providers, searchParams, router]);

  if (!tmdbId) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-lg mb-6">لم يتم اختيار فيلم</p>
          <button onClick={() => router.push('/netflix')} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-semibold">
            تصفح الأفلام
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const qualityRank: Record<string, number> = { '360p': 0, '480p': 1, '720p': 2, '1080p': 3, '2K': 4, '4K': 5 };
  const qualities = movie?.links
    ?.filter(l => l.embed_url && l.embed_url.startsWith('http'))
    .map(l => ({ label: l.quality || '720p', url: l.embed_url, rank: qualityRank[l.quality || '720p'] || 2 }))
    .sort((a, b) => b.rank - a.rank)
    .filter((v, i, a) => a.findIndex(x => x.url === v.url) === i) || [];

  const currentProv = currentProvider < providers.length ? providers[currentProvider] as any : null;
  const embedUrl = currentProv?.needsResolution
    ? (resolvedUrl || '')
    : currentProv?.url || qualities[0]?.url || movie?.links?.[0]?.embed_url || '';

  const isEmbed = embedUrl.includes('embed') || embedUrl.includes('vidsrc') || embedUrl.includes('vidlink') || embedUrl.includes('vidcore') || embedUrl.includes('xpass') || embedUrl.includes('cinemana') || embedUrl.includes('hd1') || embedUrl.includes('anime3rb');

  return (
    <div className="min-h-screen bg-[#0e0e0e]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">رجوع</span>
          </button>
          <h1 className="text-sm text-zinc-300 truncate max-w-[300px] sm:max-w-none">
            {movie?.title || ''}
          </h1>
          <div />
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Player + Servers */}
          <div className="flex-1 min-w-0">
            {/* Player */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl shadow-black/50">
              {iframeError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400 font-bold mb-2">تعذر تحميل المشغل</p>
                    <p className="text-zinc-600 text-sm mb-4">جرب سيرفر آخر</p>
                    <div className="flex gap-2 justify-center">
                      {providers.slice(0, 4).map((p, i) => (
                        <button
                          key={p.name}
                          onClick={() => switchServer(i)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : resolving ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <div className="text-center">
                    <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3 animate-pulse" />
                    <p className="text-zinc-400 text-sm">جاري البحث عن الرابط...</p>
                  </div>
                </div>
              ) : embedUrl ? (
                isEmbed ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
                    onError={() => setIframeError(true)}
                  />
                ) : (
                  <video
                    src={embedUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <Server className="w-12 h-12 text-zinc-600 mb-3 mx-auto" />
                  <p className="text-zinc-500 text-sm">لا توجد سيرفرات متاحة لهذا المحتوى</p>
                </div>
              )}
            </div>

            {/* Server Buttons - like streamex.sh */}
            <div className="mt-4">
              {error ? (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm text-center">
                  تعذر تحميل معلومات الفيلم. تأكد من معرف TMDB.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">اختر السيرفر</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {providers.map((p: any, i) => (
                      <button
                        key={p.name}
                        onClick={() => switchServer(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          i === currentProvider
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 ring-1 ring-red-400'
                            : p.working
                              ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-white/5'
                              : 'bg-zinc-800/50 text-zinc-600 hover:bg-zinc-700/50 hover:text-zinc-400 border border-white/5'
                        }`}
                        title={p.working ? 'مشغل يعمل' : 'قد لا يعمل هذا المشغل'}
                      >
                        {p.working && <BadgeCheck className="w-3 h-3 inline mr-1 text-green-500" />}
                        {p.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Movie Info - Mobile */}
            <div className="mt-6 lg:hidden">
              <MovieInfo movie={movie} />
            </div>

            {/* Similar - Mobile */}
            {movie?.similar && movie.similar.length > 0 && (
              <div className="mt-8 lg:hidden">
                <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-500" />
                  مقترحات
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-4">
                  {movie.similar.slice(0, 10).map((m: any) => (
                    <MovieCard key={m.tmdb_id || m.id} movie={m} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Movie Info Sidebar - Desktop */}
          <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              <MovieInfo movie={movie} />

              {movie?.similar && movie.similar.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
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
    <div className="space-y-4">
      {/* Title */}
      <h1 className="text-2xl font-black text-white">{movie.title}</h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
        {movie.release_date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {movie.release_date.slice(0, 4)}
          </span>
        )}
        {movie.vote_average && (
          <span className="flex items-center gap-1 text-yellow-500">
            <Star className="w-3.5 h-3.5 fill-yellow-500" />
            {movie.vote_average.toFixed(1)}
          </span>
        )}
        {movie.runtime && (
          <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
        )}
        {movie.vote_count && (
          <span>{movie.vote_count.toLocaleString()} تقييم</span>
        )}
      </div>

      {/* Genres */}
      {movie.genres && movie.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {movie.genres.slice(0, 4).map((g) => (
            <span key={g.id} className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] border border-white/5">
              {g.name}
            </span>
          ))}
        </div>
      )}

      {/* Overview */}
      {movie.overview && (
        <div>
          <h3 className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1.5">القصة</h3>
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-6">{movie.overview}</p>
        </div>
      )}
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
