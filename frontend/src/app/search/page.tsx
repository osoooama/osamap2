'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MovieCard } from '@/components/movie/MovieCard';
import { useThemeStore } from '@/stores/theme';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useThemeStore((s) => s.theme);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">بحث</h1>
      <div className="flex gap-2 mb-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="ابحث عن فيلم أو مسلسل..."
          className="bg-zinc-800 border-zinc-700 text-white"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? '...' : 'بحث'}
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((item: any) => (
          <MovieCard
            key={item.id}
            id={String(item.id)}
            tmdbId={item.id}
            title={item.title || item.name || ''}
            posterPath={item.poster_path || ''}
            rating={item.vote_average}
            platform={theme}
          />
        ))}
      </div>
      {!loading && results.length === 0 && query && (
        <p className="text-zinc-500 text-center mt-8">لا توجد نتائج</p>
      )}
    </div>
  );
}
