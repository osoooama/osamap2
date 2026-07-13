'use client';

import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Play, Info, Search, X, Loader2, Star } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { fetchAniListTrending, searchAniList, type AnimeEntry } from '@/lib/contentSources';
import { getAnimeProviders } from '@/lib/providers';

const theme = { primary: '#F47521' };

function AnimeCard({ anime, onClick }: { anime: AnimeEntry; onClick: () => void }) {
  return (
    <div onClick={onClick} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] cursor-pointer group">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 shadow-lg shadow-black/20 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-black/50">
        {anime.cover_image ? (
          <img src={anime.cover_image} alt={anime.title} loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-zinc-600 text-5xl font-black">{anime.title[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-110 transition shadow-xl">
            <Play className="w-4 h-4 text-black fill-black ml-0.5" />
          </button>
        </div>
        {anime.score && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs border border-white/10">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-semibold">{anime.score.toFixed(1)}</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-1 rounded-lg bg-purple-600/80 backdrop-blur-md text-[10px] text-white font-semibold border border-white/10">
            أنمي
          </span>
        </div>
      </div>
      <div className="mt-2.5 px-0.5 space-y-1">
        <h3 className="text-sm font-semibold text-white truncate" dir="auto">{anime.title}</h3>
        {anime.title_japanese && (
          <p className="text-[10px] text-zinc-600 truncate" dir="auto">{anime.title_japanese}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {anime.episodes && <span>{anime.episodes} حلقة</span>}
          {anime.genres.length > 0 && <span className="truncate">{anime.genres[0]}</span>}
        </div>
      </div>
    </div>
  );
}

function AnimeRow({ title, subtitle, animeList, loading, onPlay }: { title: string; subtitle?: string; animeList: AnimeEntry[]; loading?: boolean; onPlay: (anime: AnimeEntry) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px]">
              <div className="aspect-[2/3] rounded-xl bg-zinc-900/50 animate-pulse" />
              <div className="mt-2 h-4 bg-zinc-900/50 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      ) : animeList.length === 0 ? (
        <p className="text-zinc-600 text-sm py-4">لا توجد نتائج</p>
      ) : (
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {animeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} onClick={() => onPlay(anime)} />
          ))}
        </div>
      )}
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
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن أنمي..."
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
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} onClick={() => onPlay(anime)} />
          ))}
        </div>
      ) : searched && results.length === 0 ? (
        <p className="text-zinc-600 text-sm text-center py-4">لا توجد نتائج</p>
      ) : null}
    </div>
  );
}

import { useRef } from 'react';

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
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="relative h-[60vh] sm:h-[65vh] md:h-[75vh] overflow-hidden">
          {trending[0]?.banner_image && (
            <div className="absolute inset-0">
              <img src={trending[0].banner_image} alt="" className="w-full h-full object-cover" />
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
                مسلسلات أنمي، أفلام أنمي، وفلرات. powered by AniList.
              </p>

              {trending[0] && (
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{trending[0].title}</h2>
                  <p className="text-zinc-400 text-sm max-w-xl line-clamp-2">{trending[0].overview}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => trending[0] && handlePlay(trending[0])}
                  className="flex items-center gap-2.5 px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-orange-600/30"
                >
                  <Play className="w-5 h-5 fill-white" />
                  مشاهدة الآن
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-zinc-400 text-xs border border-white/[0.03]">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  أنمي فقط
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-zinc-400 text-xs border border-white/[0.03]">
                  AniList Powered
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
          <div className="space-y-6">
            <AnimeRow title="الأكثر رواجاً" subtitle="أنمي رائج الآن" animeList={trending} loading={loading} onPlay={handlePlay} />
            <AnimeRow title="الأكثر شعبية" subtitle="أشهر أنمي" animeList={popular} loading={loading} onPlay={handlePlay} />
            <AnimeRow title="الأعلى تقييماً" subtitle="أفضل أنمي حسب التقييم" animeList={topRated} loading={loading} onPlay={handlePlay} />
            <div className="pt-6 border-t border-white/5">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">بحث أنمي</h2>
              <p className="text-xs sm:text-sm text-zinc-500 mb-4">ابحث عن أي أنمي في AniList</p>
              <AnimeSearch onPlay={handlePlay} />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
