'use client';

import AuthGuard from '@/components/AuthGuard';
import SmartPlayer from '@/components/SmartPlayer';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getMovieDetails } from '@/lib/api';
import { fetchAniListById, type AnimeEntry } from '@/lib/contentSources';
import MovieCard from '@/components/MovieCard';
import { ArrowLeft, Star, Calendar, Clock, ThumbsUp, Film, Play } from 'lucide-react';
import { getTMDBTrailer } from '@/lib/api';

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tmdbId = searchParams.get('tmdb_id');
  const animeId = searchParams.get('anime_id');
  const mediaType = searchParams.get('type') || 'movie';
  const ref = searchParams.get('ref') || 'netflix';
  const title = searchParams.get('title') || '';
  const [movie, setMovie] = useState<any>(null);
  const [anime, setAnime] = useState<AnimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    if (tmdbId) {
      getTMDBTrailer(tmdbId, mediaType as 'movie' | 'tv').then(setTrailerKey);
    }
  }, [tmdbId, mediaType]);

  useEffect(() => {
    if (animeId) {
      setLoading(true);
      fetchAniListById(Number(animeId))
        .then((data) => { setAnime(data); setLoading(false); })
        .catch(() => { setError(true); setLoading(false); });
    } else if (tmdbId) {
      setLoading(true);
      getMovieDetails(tmdbId)
        .then((data) => setMovie(data))
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tmdbId, animeId]);

  const displayTitle = anime?.title || movie?.title || title;
  const isAnime = !!animeId;
  const isTV = mediaType === 'tv';

  const category = isAnime ? 'anime' : 
    ref === 'shahid' ? (movie?.original_language === 'tr' ? 'turkish' : 'arabic') :
    ref === 'disney' ? 'animation' :
    ref === 'crunchyroll' ? 'anime' : 'foreign';

  const totalSeasons = movie?.seasons?.length || 1;
  const currentSeasonEpisodes = movie?.seasons?.find((s: any) => s.season_number === currentSeason)?.episode_count || 24;

  if (!tmdbId && !animeId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center">
            <Film className="w-10 h-10 text-zinc-600" />
          </div>
          <p className="text-zinc-500 text-lg mb-2 font-medium">لم يتم اختيار فيلم</p>
          <p className="text-zinc-700 text-sm mb-8">اختر فيلماً للبدء في المشاهدة</p>
          <button onClick={() => router.push('/netflix')} className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40">
            تصفح الأفلام
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-8 h-12 sm:h-16 flex items-center justify-between">
          <button onClick={() => router.push(`/${ref}`)} className="flex items-center gap-2 sm:gap-2.5 text-zinc-500 hover:text-white transition-all duration-200 group">
            <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-center group-hover:bg-zinc-800 transition">
              <ArrowLeft className="w-4 h-4 sm:w-4 sm:h-4" />
            </div>
            <span className="text-xs sm:text-sm hidden sm:inline">رجوع</span>
          </button>
          <h1 className="text-xs sm:text-sm font-medium text-zinc-300 truncate max-w-[200px] sm:max-w-md lg:max-w-lg">
            {displayTitle}
          </h1>
          <div className="w-16 sm:w-20" />
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="relative w-full aspect-[16/10] sm:aspect-video flex items-center justify-center bg-zinc-900 rounded-xl sm:rounded-2xl">
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-4">
                    <div className="absolute inset-0 border-3 border-emerald-600/20 rounded-full" />
                    <div className="absolute inset-0 border-3 border-transparent border-t-emerald-600 rounded-full animate-spin" />
                  </div>
                  <p className="text-zinc-500 text-sm">جاري التحميل...</p>
                </div>
              </div>
            ) : isAnime ? (
              <SmartPlayer
                animeId={animeId!}
                mediaType="anime"
                category="anime"
                platform="crunchyroll"
                episode={currentEpisode}
                totalEpisodes={anime?.episodes || 24}
                onEpisodeChange={setCurrentEpisode}
              />
            ) : (
              <SmartPlayer
                tmdbId={tmdbId!}
                mediaType={mediaType}
                category={category}
                platform={ref as 'netflix' | 'shahid' | 'disney' | 'crunchyroll'}
                season={currentSeason}
                episode={currentEpisode}
                totalSeasons={totalSeasons}
                totalEpisodes={currentSeasonEpisodes}
                onSeasonChange={setCurrentSeason}
                onEpisodeChange={setCurrentEpisode}
              />
            )}

            <div className="mt-5 sm:mt-8 lg:hidden">
              <ContentInfo movie={movie} anime={anime} error={error} isAnime={isAnime} trailerKey={trailerKey} />
            </div>
          </div>

          <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <ContentInfo movie={movie} anime={anime} error={error} isAnime={isAnime} trailerKey={trailerKey} />
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

function ContentInfo({ movie, anime, error, isAnime, trailerKey }: { movie: any; anime: AnimeEntry | null; error: boolean; isAnime: boolean; trailerKey: string | null }) {
  if (error) {
    return (
      <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm text-center">
        تعذر تحميل المعلومات.
      </div>
    );
  }

  if (isAnime && anime) {
    return (
      <div className="space-y-3 sm:space-y-5">
        <h1 className="text-lg sm:text-2xl font-black text-white leading-tight">{anime.title}</h1>
        {anime.title_japanese && <p className="text-xs sm:text-sm text-zinc-500">{anime.title_japanese}</p>}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
          {anime.score && (
            <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/5 px-3 py-1.5 rounded-xl border border-yellow-500/10">
              <Star className="w-3.5 h-3.5 fill-yellow-500" />
              {anime.score.toFixed(1)}
            </span>
          )}
          {anime.episodes && (
            <span className="flex items-center gap-1.5 text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-xl border border-white/[0.03]">
              {anime.episodes} حلقة
            </span>
          )}
          {anime.status && (
            <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 text-[10px] font-medium border border-purple-500/20">
              {anime.status === 'RELEASING' ? 'يُعرض حالياً' : anime.status === 'FINISHED' ? 'مكتمل' : anime.status === 'NOT_YET_RELEASED' ? 'قريباً' : anime.status === 'HIATUS' ? 'متوقف مؤقتاً' : anime.status === 'CANCELLED' ? 'ملغي' : anime.status}
            </span>
          )}
        </div>
        {anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {anime.genres.slice(0, 5).map((g) => (
              <span key={g} className="px-3 py-1.5 rounded-xl bg-zinc-900/80 text-zinc-400 text-[10px] font-medium border border-white/[0.03] cursor-default">
                {g}
              </span>
            ))}
          </div>
        )}
        {anime.overview && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">القصة</h3>
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-6 bg-zinc-900/30 rounded-2xl p-4 border border-white/[0.02]">
              {anime.overview}
            </p>
          </div>
        )}
        {trailerKey && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Play className="w-3 h-3 text-red-500" />
              التريلر
            </h3>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.03]">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?rel=0`}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="space-y-3 sm:space-y-5">
      <h1 className="text-lg sm:text-2xl font-black text-white leading-tight">{movie.title}</h1>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
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
            {Math.floor(movie.runtime / 60)} س {movie.runtime % 60} د
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
      {trailerKey && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Play className="w-3 h-3 text-red-500" />
            التريلر
          </h3>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.03]">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?rel=0`}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          </div>
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
              <div className="absolute inset-0 border-4 border-emerald-600/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin" />
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
