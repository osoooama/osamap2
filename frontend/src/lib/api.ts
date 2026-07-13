import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

export default api;

const TMDB_KEY = 'b4905ea858601abd0565baa117b69b24';

export async function getMovies(category: string, page = 1, type?: string) {
  const params: any = { page };
  if (type) params.type = type;
  const { data } = await api.get(`/api/movies/category/${category}`, { params });
  return data;
}

export async function getMovieDetails(tmdb_id: string) {
  const { data } = await api.get(`/api/movies/details/${tmdb_id}`);
  return data;
}

export async function searchMovies(query: string, category?: string) {
  const { data } = await api.get('/api/movies/search', { params: { q: query, category } });
  return data;
}

export async function getTMDBTrailer(tmdbId: string, mediaType: 'movie' | 'tv' = 'movie'): Promise<string | null> {
  try {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/videos?api_key=${TMDB_KEY}&language=ar-SA`
    );
    const trailer =
      data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') ||
      data.results?.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube') ||
      data.results?.find((v: any) => v.site === 'YouTube');
    return trailer?.key || null;
  } catch {
    return null;
  }
}

export async function getTMDBTrailers(tmdbIds: string[], mediaType: 'movie' | 'tv' = 'movie'): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  await Promise.allSettled(
    tmdbIds.slice(0, 5).map(async (id) => {
      const key = await getTMDBTrailer(id, mediaType);
      if (key) results[id] = key;
    })
  );
  return results;
}