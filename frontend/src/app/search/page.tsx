'use client';

import AuthGuard from '@/components/AuthGuard';
import { useState, useEffect } from 'react';
import { Search, X, Loader2, Film } from 'lucide-react';
import api from '@/lib/api';

function SearchContent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [localResults, setLocalResults] = useState<any[]>([]);
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLocalResults([]);
      setTmdbResults([]);
      setSearched(false);
      return;
    }
    const timer = setTimeout(() => performSearch(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get('/api/movies/search', { params: { q } });
      setLocalResults(data?.local || []);
      setTmdbResults(data?.tmdb || []);
      const all = [...(data?.local || []), ...(data?.tmdb || [])].filter(
        (v, i, a) => a.findIndex((x: any) => x.tmdb_id === v.tmdb_id) === i
      );
      setResults(all);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1 font-arabic-display">بحث</h1>
          <p className="text-zinc-500 text-sm">ابحث عن أفلام ومسلسلات في مكتبتنا</p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="relative mb-8">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن فيلم أو مسلسل..."
              className="w-full pr-12 pl-12 py-4 rounded-2xl bg-zinc-900 border border-white/10 text-white text-lg focus:outline-none focus:border-emerald-500/50 transition placeholder:text-zinc-700"
              autoFocus
              dir="auto"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSearched(false); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : searched ? (
          results.length === 0 ? (
            <div className="text-center py-20">
              <Film className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-lg">لا توجد نتائج لـ &quot;{query}&quot;</p>
              <p className="text-zinc-700 text-sm mt-1">حاول بكلمات بحث مختلفة</p>
            </div>
          ) : (
            <div className="space-y-8">
              {localResults.length > 0 && (
                <Section title="في مكتبتنا" items={localResults} />
              )}
              {tmdbResults.length > 0 && (
                <Section title="نتائج من TMDB" items={tmdbResults} />
              )}
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-600">اكتب اسم الفيلم أو المسلسل للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: any[] }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 rounded-full bg-emerald-500" />
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <span className="text-xs text-zinc-600">({items.length})</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {items.map((movie: any) => {
          const poster = movie.poster || movie.poster_path || '';
          const imgSrc = poster.startsWith('http') ? poster : poster ? `https://image.tmdb.org/t/p/w500${poster}` : '';
          const tmdbId = movie.tmdb_id || movie.id;
          const title = movie.title || movie.name || 'غير معروف';
          const mediaType = movie.media_type || 'movie';
          const year = (movie.release_date || '').slice(0, 4) || (movie.first_air_date || '').slice(0, 4);
          const rating = movie.vote_average;

          return (
            <a
              key={tmdbId}
              href={`/player?tmdb_id=${tmdbId}&type=${mediaType}`}
              className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900"
            >
              {imgSrc ? (
                <img src={imgSrc} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                  <span className="text-zinc-600 text-3xl font-black">{title[0]}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-bold truncate">{title}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                  {year && <span>{year}</span>}
                  {rating && <span className="text-yellow-500">⭐ {rating.toFixed(1)}</span>}
                </div>
              </div>
              {rating && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 text-xs text-yellow-400">
                  {rating.toFixed(1)}
                </div>
              )}
              <div className="absolute top-2 left-2">
                {mediaType === 'tv' && (
                  <div className="px-2 py-0.5 rounded-lg bg-blue-600/80 text-[10px] text-white">مسلسل</div>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <AuthGuard>
      <SearchContent />
    </AuthGuard>
  );
}
