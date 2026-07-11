'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getMovieDetails } from '@/lib/api';
import VideoPlayerOverlay from '@/components/VideoPlayerOverlay';
import MovieCard from '@/components/MovieCard';

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
  genres?: { id: number; name: string }[];
}

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tmdbId = searchParams.get('tmdb_id');
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tmdbId) { setLoading(false); return; }
    getMovieDetails(tmdbId)
      .then((data) => setMovie(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tmdbId]);

  if (!tmdbId) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <p className="text-zinc-400 text-lg">لم يتم تحديد فيلم</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const qualityRank: Record<string, number> = { '360p': 0, '480p': 1, '720p': 2, '1080p': 3, '2K': 4, '4K': 5 };
  const qualities = movie?.links
    ?.filter(l => l.embed_url && l.embed_url.startsWith('http'))
    .map(l => ({ label: l.quality || '720p', url: l.embed_url, rank: qualityRank[l.quality || '720p'] || 2 }))
    .sort((a, b) => b.rank - a.rank)
    .filter((v, i, a) => a.findIndex(x => x.url === v.url) === i) || [];

  const embedUrl = qualities[0]?.url || movie?.embed_urls?.[0] || movie?.links?.[0]?.embed_url || '';

  return (
    <div className="min-h-screen bg-[#141414]">
      <VideoPlayerOverlay
        isOpen={true}
        onClose={() => router.push(`/${movie?.category || ''}`)}
        embedUrl={embedUrl}
        subtitleUrl={movie?.subtitles?.[0]}
        title={movie?.title || ''}
        poster={movie?.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : ''}
        qualities={qualities}
      />
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
