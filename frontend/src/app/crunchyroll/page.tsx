'use client';

import { useMovies } from '@/hooks/useMovies';
import MovieRow from '@/components/MovieRow';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Play, Info, Search, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

const theme = { primary: '#F47521' };

const ANIME_GENRES = new Set(['Animation', 'Anime', 'أنمي', 'رسوم متحركة', 'Action & Adventure', 'Sci-Fi & Fantasy', 'Fantasy', 'Action']);
const NON_ANIME_KEYWORDS = ['documentary', 'reality', 'talk show', 'news', 'sport'];

function isAnime(movie: any): boolean {
  if (movie.original_language === 'ja') return true;
  const genres = movie.genres || [];
  const genreNames = genres.map((g: any) => g.name);
  const genreIds = genres.map((g: any) => g.id);
  if (genreIds.includes(16)) return true;
  const hasAnimeGenre = genreNames.some((n: string) => ANIME_GENRES.has(n));
  const title = (movie.title || movie.name || '').toLowerCase();
  const hasNonAnimeKeyword = NON_ANIME_KEYWORDS.some(k => title.includes(k));
  return hasAnimeGenre && !hasNonAnimeKeyword;
}

function Billboard({ movies, isLoading }: { movies: any[]; isLoading: boolean }) {
  const router = useRouter();
  const featured = !isLoading && movies?.length > 0 ? movies[0] : null;
  const backdropUrl = featured?.backdrop_path ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}` : null;

  return (
    <div className="relative h-[60vh] sm:h-[65vh] md:h-[75vh] overflow-hidden">
      {backdropUrl && (
        <div className="absolute inset-0">
          <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />
        </div>
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(244,117,33,0.08) 0%, transparent 40%)' }} />

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-2 ring-orange-500/20 mb-5 shadow-2xl"
          >
            <Image src="/crunchyroll.webp" alt="Crunchyroll" width={80} height={80} className="w-full h-full object-cover" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.9] mb-3">
            Crunchyroll
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-xl mb-4 leading-relaxed">
            مسلسلات أنمي، أفلام أنمي، وفلرات. المحتوى مخصص للأنمي فقط.
          </p>

          {featured && (
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{featured.title}</h2>
              <p className="text-zinc-400 text-sm max-w-xl line-clamp-2">{featured.overview}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => featured?.tmdb_id && router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'tv'}&ref=crunchyroll`)}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-600/30"
            >
              <Play className="w-5 h-5 fill-white" />
              مشاهدة الآن
            </button>
            {featured?.tmdb_id && (
              <button
                onClick={() => router.push(`/player?tmdb_id=${featured.tmdb_id}&type=${featured.media_type || 'tv'}&ref=crunchyroll`)}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl backdrop-blur-md border border-white/10 transition-all"
              >
                <Info className="w-5 h-5" />
                التفاصيل
              </button>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-zinc-400 text-xs border border-white/[0.03]">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              أنمي فقط
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-zinc-400 text-xs border border-white/[0.03]">
              مسلسلات + أفلام + فلرات
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AnimeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const key = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'b4905ea858601abd0565baa117b69b24';
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(q)}&language=ja-JA&page=1`);
      const data = await res.json();
      const anime = (data.results || []).filter((m: any) => {
        if (m.original_language !== 'ja') return false;
        const genreIds = m.genre_ids || [];
        if (!genreIds.includes(16) && !genreIds.includes(14)) return false;
        const title = (m.title || m.name || '').toLowerCase();
        if (['documentary', 'reality', 'talk show', 'news', 'sport'].some(k => title.includes(k))) return false;
        return true;
      }).map((m: any) => ({
        tmdb_id: m.id,
        title: m.title || m.name,
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        vote_average: m.vote_average,
        release_date: m.release_date || m.first_air_date,
        media_type: m.media_type === 'tv' ? 'tv' : 'movie',
        overview: m.overview,
        genre: 'anime',
      }));
      setResults(anime.slice(0, 20));
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
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن أنمي ياباني…"
          className="w-full pr-11 pl-11 py-3 rounded-xl bg-zinc-900/80 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500/50 transition placeholder:text-zinc-600"
          dir="auto"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
        </div>
      ) : searched && results.length > 0 ? (
        <MovieRow title="نتائج البحث الياباني" subtitle={`${results.length} نتيجة`} movies={results} accentColor={theme.primary} platformRef="crunchyroll" />
      ) : searched && results.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-4">لا توجد نتائج أنمي يابانية</p>
      ) : null}
    </div>
  );
}

export default function CrunchyrollPage() {
  const { data: rawSeries, isLoading: seriesLoading } = useMovies('anime', 1, 'tv');
  const { data: rawMovies, isLoading: moviesLoading } = useMovies('anime', 1, 'movie');
  const { data: rawTop, isLoading: topLoading } = useMovies('anime', 2, 'tv');

  const animeSeries = (rawSeries || []).filter(isAnime);
  const animeMovies = (rawMovies || []).filter(isAnime);
  const topRated = (rawTop || []).filter(isAnime);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Billboard movies={animeSeries} isLoading={seriesLoading} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
          <div className="space-y-6">
            <MovieRow title="مسلسلات أنمي" subtitle="أشهر مسلسلات الأنمي" movies={animeSeries} accentColor={theme.primary} loading={seriesLoading} platformRef="crunchyroll" />
            <MovieRow title="أفلام أنمي" subtitle="أفلام الأنمي المميزة" movies={animeMovies} accentColor={theme.primary} loading={moviesLoading} platformRef="crunchyroll" />
            <MovieRow title="الأكثر تقييماً" subtitle="أفضل أنمي حسب التقييم" movies={topRated} accentColor={theme.primary} loading={topLoading} platformRef="crunchyroll" />
            <div className="pt-6 border-t border-white/5">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">بحث ياباني</h2>
              <p className="text-xs sm:text-sm text-zinc-500 mb-4">ابحث عن أنمي باللغة اليابانية</p>
              <AnimeSearch />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
