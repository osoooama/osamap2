'use client';
import { useWishlistStore } from '@/stores/wishlist';
import { useSelectedMovie } from '@/stores/selectedMovie';
import { sounds } from '@/lib/sounds';
import { haptics } from '@/lib/haptics';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface MovieCardProps {
  id: string;
  tmdbId: number;
  title: string;
  posterPath: string;
  rating?: number;
  platform: 'netflix' | 'shahid' | 'disney' | 'crunchyroll';
}

export function MovieCard({ id, tmdbId, title, posterPath, rating, platform }: MovieCardProps) {
  const { toggle, isWished } = useWishlistStore();
  const selectMovie = useSelectedMovie((s) => s.set);
  const wished = isWished(id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
    if (wished) { sounds.removeFromCart(); haptics.light(); }
    else { sounds.wishlist(); haptics.light(); }
  };

  const handleClick = () => {
    haptics.light();
    sounds.click();
    selectMovie(tmdbId);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative rounded-xl overflow-hidden group cursor-pointer bg-[#1a1a1a]"
      onClick={handleClick}
    >
      <div className="aspect-[2/3] relative">
        <Image
          src={`https://image.tmdb.org/t/p/w500${posterPath}`}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-white font-bold text-sm truncate">{title}</h3>
        {rating && <span className="text-yellow-400 text-xs">⭐ {rating.toFixed(1)}</span>}
      </div>
      <button
        onClick={handleWishlist}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <span className={wished ? 'text-yellow-400' : 'text-white'}>{wished ? '♥' : '♡'}</span>
      </button>
    </motion.div>
  );
}
