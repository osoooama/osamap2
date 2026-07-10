'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getMovieDetails } from '@/lib/api';
import VideoPlayerOverlay from '@/components/VideoPlayerOverlay';

function PlayerContent() {
  const searchParams = useSearchParams();
  const tmdbId = searchParams.get('tmdb_id');
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['movie', tmdbId],
    queryFn: () => getMovieDetails(tmdbId!),
    enabled: !!tmdbId,
  });

  const embedUrl = data?.embed_urls?.[0] || data?.links?.[0]?.embed_url || '';

  return (
    <VideoPlayerOverlay
      isOpen={true}
      onClose={() => router.push('/')}
      embedUrl={embedUrl}
      title={data?.title || 'جاري التحميل...'}
      subtitleUrl={data?.subtitles?.[0]}
    />
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>}>
      <PlayerContent />
    </Suspense>
  );
}
