'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import VideoPlayerOverlay from './VideoPlayerOverlay';

interface MovieCardProps {
  movie: {
    tmdb_id: string;
    title: string;
    poster?: string;
    poster_path?: string;
    embed_urls?: string[];
  };
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedEmbedUrl, setSelectedEmbedUrl] = useState('');

  const posterUrl = movie.poster || movie.poster_path || '';
  const imgSrc = posterUrl
    ? (posterUrl.startsWith('http') ? posterUrl : `https://image.tmdb.org/t/p/w500${posterUrl}`)
    : '/placeholder.svg';

  const handlePlay = () => {
    const url = movie.embed_urls?.[0] || '';
    if (url) {
      setSelectedEmbedUrl(url);
      setIsPlayerOpen(true);
    }
  };

  return (
    <>
      <div className="group relative flex-shrink-0 cursor-pointer transition duration-300 ease-in-out hover:scale-105 hover:drop-shadow-lg">
        <div
          className="relative h-56 w-40 overflow-hidden rounded-md sm:w-48 lg:w-56 lg:h-72"
          onClick={handlePlay}
        >
          <Image
            src={imgSrc}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 224px"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black">
              <Play className="h-6 w-6 fill-current" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium truncate">{movie.title}</p>
      </div>

      <VideoPlayerOverlay
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        embedUrl={selectedEmbedUrl}
        title={movie.title}
      />
    </>
  );
}
