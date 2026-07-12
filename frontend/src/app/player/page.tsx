'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getMovieDetails } from '@/lib/api';
import { getProvidersWithPriority } from '@/lib/providers';
import VideoPlayerOverlay from '@/components/VideoPlayerOverlay';
import MovieCard from '@/components/MovieCard';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Calendar, Clock, Film, AlertCircle } from 'lucide-react';

interface MovieData {
  tmdb_id: string;
  title: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  embed_urls?: string[];
  links?: { embed_url: string; quality?: string; source?: string }[];
  subtitles?: string[];
  category?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  similar?: any[];
}

const FALLBACK_PROVIDER_PRIORITIES: { name: string; url: string; priority: number }[] = [];

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tmdbId = searchParams.get('tmdb_id');
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(0);
  const [playerOpen, setPlayerOpen] = useState(false);
  const mediaType = searchParams.get('type') || 'movie';

  useEffect(() => {
    if (!tmdbId) { setLoading(false); return; }

    const providerUrls = getProvidersWithPriority(tmdbId, mediaType);
    FALLBACK_PROVIDER_PRIORITIES.length = 0;
    FALLBACK_PROVIDER_PRIORITIES.push(...providerUrls);

    getMovieDetails(tmdbId)
      .then((data) => setMovie(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [tmdbId, mediaType]);

  if (!tmdbId) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 text-lg">لم يتم تحديد فيلم</p>
          <button onClick={() => router.back()} className="mt-6 px-6 py-2.5 glass text-white rounded-xl hover:bg-white/10 transition">
            العودة
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
          <div className="w-14 h-14 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin absolute inset-0 opacity-50" style={{ animationDirection: 'reverse' }} />
        </div>
      </div>
    );
  }

  const qualityRank: Record<string, number> = { '360p': 0, '480p': 1, '720p': 2, '1080p': 3, '2K': 4, '4K': 5 };
  const qualities = movie?.links
    ?.filter(l => l.embed_url && l.embed_url.startsWith('http'))
    .map(l => ({ label: l.quality || '720p', url: l.embed_url, rank: qualityRank[l.quality || '720p'] || 2 }))
    .sort((a, b) => b.rank - a.rank)
    .filter((v, i, a) => a.findIndex(x => x.url === v.url) === i) || [];

  const providerUrls = FALLBACK_PROVIDER_PRIORITIES.length > 0
    ? FALLBACK_PROVIDER_PRIORITIES
    : getProvidersWithPriority(tmdbId, mediaType);

  const embedUrl = currentProvider < providerUrls.length
    ? providerUrls[currentProvider].url
    : qualities[0]?.url || movie?.embed_urls?.[0] || movie?.links?.[0]?.embed_url || '';

  const handleProviderFallback = () => {
    if (currentProvider < providerUrls.length - 1) {
      setCurrentProvider(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          رجوع
        </button>
      </div>

      {/* Movie Hero */}
      <div className="relative h-[40vh] sm:h-[55vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: movie?.backdrop_path
              ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
              : undefined,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              {movie?.title || 'غير معروف'}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-zinc-400 mb-4">
              {movie?.release_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {movie.release_date.slice(0, 4)}
                </span>
              )}
              {movie?.vote_average && (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {movie?.runtime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
              {movie?.vote_count && (
                <span className="flex items-center gap-1.5">
                  <Film className="w-4 h-4" />
                  {movie.vote_count.toLocaleString()} تقييم
                </span>
              )}
            </div>

            {movie?.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.slice(0, 4).map((g) => (
                  <span key={g.id} className="px-3 py-1 rounded-full bg-white/10 text-zinc-300 text-xs border border-white/5">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => setPlayerOpen(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg shadow-red-600/25 flex items-center gap-2"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              مشاهدة الآن
            </button>
          </motion.div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster & Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl">
                {movie?.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <span className="text-zinc-600 text-6xl font-black">
                      {movie?.title?.[0] || '?'}
                    </span>
                  </div>
                )}
              </div>

              {/* Provider Selection */}
              {providerUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-zinc-500 text-xs mb-2">مزود التشغيل:</p>
                  <div className="flex flex-wrap gap-2">
                    {providerUrls.map((p, i) => (
                      <button
                        key={p.name}
                        onClick={() => setCurrentProvider(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          i === currentProvider
                            ? 'bg-red-600 text-white'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description & Similar */}
          <div className="lg:col-span-2">
            {movie?.overview && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">القصة</h2>
                <p className="text-zinc-400 leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {qualities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">الجودة المتاحة</h2>
                <div className="flex flex-wrap gap-2">
                  {qualities.map((q) => (
                    <span key={q.label} className="px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 text-sm border border-white/5">
                      {q.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie?.similar && movie.similar.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">محتوى مشابه</h2>
                <div className="flex gap-3 overflow-x-auto pb-4">
                  {movie.similar.slice(0, 8).map((m: any) => (
                    <MovieCard key={m.tmdb_id || m.id} movie={m} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Overlay */}
      <VideoPlayerOverlay
        isOpen={playerOpen}
        onClose={() => setPlayerOpen(false)}
        embedUrl={embedUrl}
        subtitleUrl={movie?.subtitles?.[0]}
        title={movie?.title || ''}
        poster={movie?.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : ''}
        qualities={qualities}
        onError={handleProviderFallback}
        providerName={currentProvider < providerUrls.length ? providerUrls[currentProvider].name : undefined}
      />
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
