'use client';

import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Search, X, Loader2, Star, Volume2, VolumeX, Heart, Clock, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAniListTrending, searchAniList, type AnimeEntry } from '@/lib/contentSources';
import { getAnimeProviders } from '@/lib/providers';

const theme = { primary: '#F47521' };

function Carousel({ animes, onPlay }: { animes: AnimeEntry[]; onPlay: (a: AnimeEntry) => void }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [muted, setMuted] = useState(true);

  const featured = animes[current % animes.length];

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(c => (c + 1) % animes.length);
  }, [animes.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(c => (c - 1 + animes.length) % animes.length);
  }, [animes.length]);

  useEffect(() => {
    if (animes.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [animes.length, next]);

  if (!featured) return null;

  return (
    <section className="relative h-[55vh] sm:h-[65vh] md:h-[75vh] overflow-hidden bg-[#0a0a0a]">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, x: direction >= 0 ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction >= 0 ? -100 : 100 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {featured.banner_image ? (
            <img src={featured.banner_image} alt="" className="w-full h-full object-cover" style={{ animation: 'kenBurns 20s ease-in-out infinite alternate' }} />
          ) : featured.cover_image ? (
            <img src={featured.cover_image} alt="" className="w-full h-full object-cover object-top scale-110" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-900/40 to-[#0a0a0a]" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays — Crunchyroll style: strong left-to-right */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/40 to-transparent" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(244,117,33,0.06) 0%, transparent 40%)' }} />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          {/* Anime title logo (text-based) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 sm:mb-6"
          >
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.9] drop-shadow-2xl">
              {featured.title}
            </h1>
          </motion.div>

          {/* Genre tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {featured.genres.slice(0, 3).map((g, i) => (
              <span key={i} className="px-2.5 py-1 rounded bg-[#F47521]/20 text-[#F47521] text-xs font-semibold border border-[#F47521]/20">
                {g}
              </span>
            ))}
            {featured.episodes && (
              <span className="px-2.5 py-1 rounded bg-white/5 text-zinc-400 text-xs border border-white/10">
                {featured.episodes} حلقة
              </span>
            )}
            {featured.score && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 text-xs font-semibold border border-yellow-500/10">
                <Star className="w-3 h-3 fill-yellow-400" />
                {featured.score.toFixed(1)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-zinc-300 text-sm sm:text-base max-w-2xl mb-4 sm:mb-6 leading-relaxed line-clamp-3">
            {featured.overview}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onPlay(featured)}
              className="flex items-center gap-2.5 px-7 sm:px-9 py-3 sm:py-3.5 bg-[#F47521] hover:bg-[#ff8839] text-[#23252b] font-bold text-sm sm:text-base rounded transition-all duration-300 shadow-lg shadow-[#F47521]/30"
            >
              <Play className="w-5 h-5 fill-[#23252b]" />
              مشاهدة الآن
            </button>
            <button className="flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium text-sm sm:text-base rounded backdrop-blur-md border border-white/10 transition-all">
              <Heart className="w-4 h-4" />
              أضف للمفضلة
            </button>
          </div>
        </motion.div>
      </div>

      {/* Mute toggle */}
      <button
        onClick={() => setMuted(!muted)}
        className="absolute bottom-5 sm:bottom-8 right-4 sm:right-8 w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </section>
  );
}

function AnimeCard({ anime, onClick }: { anime: AnimeEntry; onClick: () => void }) {
  return (
    <div onClick={onClick} className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[203px] cursor-pointer group">
      <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#23252b] shadow-lg shadow-black/20 transition-all duration-300 group-hover:shadow-xl">
        {anime.cover_image ? (
          <img src={anime.cover_image} alt={anime.title} loading="lazy" className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-50" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23252b] to-[#141519]">
            <span className="text-zinc-600 text-4xl font-black">{anime.title[0]}</span>
          </div>
        )}
        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#F47521] flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 text-[#23252b] fill-[#23252b] ml-0.5" />
          </div>
        </div>
        {/* Score badge */}
        {anime.score && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px]">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-semibold">{anime.score.toFixed(1)}</span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-1.5 left-1.5">
          <span className="px-1.5 py-0.5 rounded bg-[#F47521]/80 backdrop-blur-sm text-[9px] text-white font-bold uppercase">
            {anime.status === 'RELEASING' ? 'جديد' : anime.status === 'FINISHED' ? 'مكتمل' : anime.status}
          </span>
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="text-[13px] font-semibold text-[#c2c1c3] truncate leading-tight" dir="auto">{anime.title}</h3>
        {anime.title_japanese && (
          <p className="text-[10px] text-[#a0a0a0] truncate mt-0.5" dir="auto">{anime.title_japanese}</p>
        )}
      </div>
    </div>
  );
}

function AnimeRow({ title, subtitle, animeList, loading, onPlay }: { title: string; subtitle?: string; animeList: AnimeEntry[]; loading?: boolean; onPlay: (anime: AnimeEntry) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragStart.current = { x: e.pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStart.current.x) * 1.5;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    dragStart.current = { x: e.touches[0].pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStart.current.x) * 1.5;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - walk;
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#c2c1c3]">{title}</h2>
          {subtitle && <p className="text-[11px] text-[#a0a0a0] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {loading ? (
        <div className="flex gap-3 sm:gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[140px] sm:w-[180px]">
              <div className="aspect-[2/3] rounded bg-[#23252b]/50 animate-pulse" />
              <div className="mt-2 h-3 bg-[#23252b]/50 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      ) : animeList.length === 0 ? (
        <p className="text-[#a0a0a0] text-sm py-4">لا توجد نتائج</p>
      ) : (
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide select-none"
            style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory', cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {animeList.map((anime) => (
              <div key={anime.id} style={{ scrollSnapAlign: 'start' }}>
                <AnimeCard anime={anime} onClick={() => onPlay(anime)} />
              </div>
            ))}
          </div>
      )}
    </div>
  );
}

function ContinueWatching({ animes, onPlay }: { animes: AnimeEntry[]; onPlay: (a: AnimeEntry) => void }) {
  if (animes.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-[#c2c1c3]">Seguir viendo</h2>
        </div>
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {animes.slice(0, 8).map((anime, i) => {
          const progress = Math.floor(Math.random() * 80) + 10;
          const minsLeft = Math.floor(Math.random() * 20) + 2;
          return (
            <div key={anime.id} onClick={() => onPlay(anime)} className="flex-shrink-0 w-[260px] sm:w-[300px] cursor-pointer group/watch">
              <div className="relative rounded overflow-hidden bg-[#23252b]">
                <div className="relative aspect-video">
                  {anime.banner_image || anime.cover_image ? (
                    <img
                      src={anime.banner_image || anime.cover_image}
                      alt=""
                      className="w-full h-full object-cover transition-all duration-300 group-hover/watch:brightness-75"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#23252b] to-[#141519]" />
                  )}
                  {/* Play icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/watch:opacity-100 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-[#F47521] flex items-center justify-center shadow-xl">
                      <Play className="w-4 h-4 text-[#23252b] fill-[#23252b] ml-0.5" />
                    </div>
                  </div>
                  {/* Time badge */}
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-white">
                    {minsLeft} min
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-[#141519]">
                  <div className="h-full bg-[#F47521] transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="mt-2 px-0.5">
                <p className="text-[11px] text-[#a0a0a0] uppercase truncate font-medium">{anime.title}</p>
                <p className="text-[13px] text-[#c2c1c3] truncate font-semibold mt-0.5">الحلقة {i + 1}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecommendedCard({ anime, onPlay }: { anime: AnimeEntry; onPlay: (a: AnimeEntry) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-4 sm:gap-6 bg-[#141519] rounded-xl overflow-hidden border border-white/5">
      <div className="relative aspect-video md:aspect-auto overflow-hidden cursor-pointer" onClick={() => onPlay(anime)}>
        {anime.banner_image || anime.cover_image ? (
          <img src={anime.banner_image || anime.cover_image} alt="" className="w-full h-full object-cover hover:brightness-75 transition-all duration-300" />
        ) : (
          <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-[#23252b] to-[#141519]" />
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-[#F47521] flex items-center justify-center shadow-xl">
            <Play className="w-6 h-6 text-[#23252b] fill-[#23252b] ml-0.5" />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{anime.title}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#2abdbb] text-xs font-semibold uppercase">
            {anime.genres[0] || 'أنمي'}
          </span>
          <span className="text-[#a0a0a0] text-xs">|</span>
          <span className="text-[#a0a0a0] text-xs">{anime.episodes || '?'} حلقة</span>
          {anime.score && (
            <>
              <span className="text-[#a0a0a0] text-xs">|</span>
              <span className="flex items-center gap-1 text-yellow-400 text-xs">
                <Star className="w-3 h-3 fill-yellow-400" />
                {anime.score.toFixed(1)}
              </span>
            </>
          )}
        </div>
        <p className="text-[#a0a0a0] text-sm leading-relaxed line-clamp-3 mb-4">{anime.overview}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlay(anime)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#F47521] hover:bg-[#ff8839] text-[#23252b] font-bold text-sm rounded transition-all duration-300 shadow-lg shadow-[#F47521]/20"
          >
            <Play className="w-4 h-4 fill-[#23252b]" />
            شاهد الآن
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-[#F47521] font-medium text-sm rounded border border-[#F47521]/30 transition-all">
            <Heart className="w-4 h-4" />
            أضف للمفضلة
          </button>
        </div>
      </div>
    </div>
  );
}

function PromoBanner({ anime, onPlay }: { anime: AnimeEntry; onPlay: (a: AnimeEntry) => void }) {
  if (!anime?.banner_image) return null;
  return (
    <div className="relative rounded-xl overflow-hidden cursor-pointer group/banner" onClick={() => onPlay(anime)}>
      <img src={anime.banner_image} alt="" className="w-full h-[200px] sm:h-[280px] object-cover transition-all duration-500 group-hover/banner:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8">
        <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">{anime.title}</h3>
        <p className="text-[#a0a0a0] text-xs sm:text-sm line-clamp-1 max-w-md">{anime.overview}</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-all duration-300">
        <div className="w-14 h-14 rounded-full bg-[#F47521] flex items-center justify-center shadow-2xl transform scale-75 group-hover/banner:scale-100 transition-transform duration-300">
          <Play className="w-6 h-6 text-[#23252b] fill-[#23252b] ml-0.5" />
        </div>
      </div>
    </div>
  );
}

function AnimeSearch({ onPlay }: { onPlay: (anime: AnimeEntry) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchAniList(q);
      setResults(data.slice(0, 20));
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0a0a0]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anime... Naruto, One Piece, Evangelion..."
          className="w-full pr-11 pl-11 py-3 rounded bg-[#23252b] border border-[#4a4e58] text-[#c2c1c3] text-sm focus:outline-none focus:border-[#F47521] transition placeholder:text-[#a0a0a0]"
          dir="auto"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-[#F47521] animate-spin" />
        </div>
      ) : searched && results.length > 0 ? (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} onClick={() => onPlay(anime)} />
          ))}
        </div>
      ) : searched && results.length === 0 ? (
        <p className="text-[#a0a0a0] text-sm text-center py-4">لا توجد نتائج</p>
      ) : null}
    </div>
  );
}

export default function CrunchyrollPage() {
  const router = useRouter();
  const [trending, setTrending] = useState<AnimeEntry[]>([]);
  const [popular, setPopular] = useState<AnimeEntry[]>([]);
  const [topRated, setTopRated] = useState<AnimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAniListTrending(1, 20),
      fetchAniListTrending(2, 20),
      fetchAniListTrending(3, 10),
    ]).then(([t, p, tr]) => {
      setTrending(t);
      setPopular(p);
      setTopRated(tr);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePlay = useCallback((anime: AnimeEntry) => {
    const providers = getAnimeProviders(anime.anilist_id, 1, 'sub');
    if (providers.length > 0) {
      router.push(`/player?anime_id=${anime.anilist_id}&type=anime&ref=crunchyroll&title=${encodeURIComponent(anime.title)}`);
    }
  }, [router]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#000]">
        {/* Hero Carousel */}
        <Carousel animes={trending.slice(0, 5)} onPlay={handlePlay} />

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-10 pb-12 sm:pb-16 space-y-8 sm:space-y-10">
          {/* New Episodes */}
          <AnimeRow
            title="Episodios Nuevos"
            subtitle="أحدث حلقات الأنمي"
            animeList={trending}
            loading={loading}
            onPlay={handlePlay}
          />

          {/* Continue Watching */}
          <ContinueWatching animes={popular.slice(0, 8)} onPlay={handlePlay} />

          {/* Recommended for you */}
          {trending[1] && (
            <RecommendedCard anime={trending[1]} onPlay={handlePlay} />
          )}

          {/* Promo Banner */}
          {trending[2] && (
            <PromoBanner anime={trending[2]} onPlay={handlePlay} />
          )}

          {/* Popular */}
          <AnimeRow
            title="Popular"
            subtitle="الأنمي الأكثر شعبية"
            animeList={popular}
            loading={loading}
            onPlay={handlePlay}
          />

          {/* Second recommended card */}
          {popular[2] && (
            <RecommendedCard anime={popular[2]} onPlay={handlePlay} />
          )}

          {/* Second promo banner */}
          {topRated[0] && (
            <PromoBanner anime={topRated[0]} onPlay={handlePlay} />
          )}

          {/* Top Rated */}
          <AnimeRow
            title="Top Rated"
            subtitle="الأعلى تقييماً"
            animeList={topRated}
            loading={loading}
            onPlay={handlePlay}
          />

          {/* Search */}
          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base sm:text-lg font-bold text-[#c2c1c3]">Search</h2>
            </div>
            <p className="text-[11px] text-[#a0a0a0] mb-4">ابحث عن أي أنمي في AniList</p>
            <AnimeSearch onPlay={handlePlay} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
