'use client';

import SmartPlayer from '@/components/SmartPlayer';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getMovieDetails } from '@/lib/api';
import { fetchAniListById, type AnimeEntry } from '@/lib/contentSources';
import { ArrowLeft, Film } from 'lucide-react';

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
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);

  useEffect(() => {
    if (animeId) {
      setLoading(true);
      fetchAniListById(Number(animeId))
        .then((data) => { setAnime(data); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (tmdbId) {
      setLoading(true);
      getMovieDetails(tmdbId, mediaType)
        .then((data) => setMovie(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tmdbId, animeId]);

  const displayTitle = anime?.title || movie?.title || title;
  const isAnime = !!animeId;

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
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-center">
            <Film className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-zinc-500 text-sm mb-1">لم يتم اختيار فيلم</p>
          <p className="text-zinc-700 text-xs mb-6">اختر فيلماً للبدء في المشاهدة</p>
          <button onClick={() => router.push(`/${ref}`)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all">
            تصفح الأفلام
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center gap-3">
          <button
            onClick={() => router.push(`/${ref}`)}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xs sm:text-sm font-medium text-zinc-400 truncate">
            {displayTitle}
          </h1>
        </div>
      </div>

      {/* Player — full width */}
      <div className="max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6">
        {loading ? (
          <div className="relative w-full aspect-video flex items-center justify-center bg-zinc-900 rounded-lg sm:rounded-xl">
            <div className="text-center">
              <div className="relative w-10 h-10 mx-auto mb-3">
                <div className="absolute inset-0 border-2 border-emerald-600/20 rounded-full" />
                <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin" />
              </div>
              <p className="text-zinc-600 text-xs">جاري التحميل...</p>
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
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-3 border-emerald-600/20 rounded-full" />
          <div className="absolute inset-0 border-3 border-transparent border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
