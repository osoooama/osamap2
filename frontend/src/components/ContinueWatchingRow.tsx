'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContinueWatchingRowProps {
  onInfo?: (movie: any) => void;
}

function getWatchHistory(): any[] {
  try {
    const raw = localStorage.getItem('osk_watch_progress');
    if (!raw) return [];
    const progress = JSON.parse(raw);
    return Object.entries(progress)
      .filter(([, val]: [string, any]) => val.progress > 5 && val.progress < 95)
      .map(([tmdbId, val]: [string, any]) => ({
        tmdb_id: tmdbId,
        title: val.title || 'غير معروف',
        poster: val.poster || '',
        media_type: val.media_type || 'movie',
        progress: val.progress || 0,
        backdrop_path: val.backdrop_path || '',
      }))
      .slice(0, 12);
  } catch {
    return [];
  }
}

export default function ContinueWatchingRow({ onInfo }: ContinueWatchingRowProps) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    setItems(getWatchHistory());
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="relative mb-5 sm:mb-8">
      <div className="flex items-end gap-2 sm:gap-3 mb-3 sm:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-0.5 sm:w-1 h-4 sm:h-6 rounded-full bg-emerald-500" />
          <div>
            <h2 className="text-sm sm:text-lg md:text-2xl font-bold text-white">إكمال المشاهدة</h2>
            <p className="text-[10px] sm:text-sm text-zinc-500 mt-0.5">من حيث توقفت</p>
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-transparent" />
      </div>

      <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {items.map((item, idx) => {
          const imgSrc = item.poster?.startsWith('http')
            ? item.poster
            : item.poster
            ? `https://image.tmdb.org/t/p/w500${item.poster}`
            : '';

          return (
            <div
              key={item.tmdb_id}
              className="relative flex-shrink-0 w-[130px] sm:w-[150px] md:w-[180px] cursor-pointer group"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onInfo?.({ ...item, media_type: item.media_type })}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 shadow-lg">
                {imgSrc ? (
                  <img src={imgSrc} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-50" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <span className="text-zinc-600 text-3xl font-black">{item.title[0]}</span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-zinc-800/80">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${item.progress}%` }} />
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                    <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="mt-1.5 px-0.5">
                <h3 className="text-[11px] sm:text-xs font-semibold text-white truncate" dir="auto">{item.title}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-zinc-500">{Math.round(item.progress)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
