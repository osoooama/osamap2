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

  const { data, isLoading } = useQuery({
    queryKey: ['movie', tmdbId],
    queryFn: () => getMovieDetails(tmdbId!),
    enabled: !!tmdbId,
  });

  if (!tmdbId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="text-center">
          <p className="text-xl mb-2">لم يتم تحديد الفيلم</p>
          <button onClick={() => router.push('/')} className="text-blue-500 hover:underline">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const embedUrl = data?.embed_urls?.[0] || data?.links?.[0]?.embed_url || '';
  const title = data?.title || 'جاري التحميل...';

  if (!embedUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-4">
        <p className="text-2xl font-bold text-white">{title}</p>
        <div className="relative w-72 h-96 rounded-lg overflow-hidden">
          <img
            src={data?.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-zinc-500">لا توجد روابط بث متاحة حالياً</p>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-zinc-800 rounded-lg text-zinc-300 hover:bg-zinc-700 transition">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <VideoPlayerOverlay
      isOpen={true}
      onClose={() => router.push('/')}
      embedUrl={embedUrl}
      title={title}
      subtitleUrl={data?.subtitles?.[0]}
    />
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>}>
      <PlayerContent />
    </Suspense>
  );
}
