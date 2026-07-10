'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getMovieDetails } from '@/lib/api';
import VideoPlayerOverlay from '@/components/VideoPlayerOverlay';

export default function PlayerPage() {
  const { tmdb_id } = useParams<{ tmdb_id: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['movie', tmdb_id],
    queryFn: () => getMovieDetails(tmdb_id),
    enabled: !!tmdb_id,
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
