const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'b4905ea858601abd0565baa117b69b24';
const BASE = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  media_type?: string;
}

export interface TMDBGenre { id: number; name: string }

export async function fetchTrending(page = 1): Promise<TMDBMovie[]> {
  const res = await fetch(`${BASE}/trending/movie/week?api_key=${TMDB_KEY}&language=ar&page=${page}`);
  const data = await res.json();
  return data.results || [];
}

export async function fetchPopular(page = 1): Promise<TMDBMovie[]> {
  const res = await fetch(`${BASE}/movie/popular?api_key=${TMDB_KEY}&language=ar&page=${page}`);
  const data = await res.json();
  return data.results || [];
}

export async function fetchTopRated(page = 1): Promise<TMDBMovie[]> {
  const res = await fetch(`${BASE}/movie/top_rated?api_key=${TMDB_KEY}&language=ar&page=${page}`);
  const data = await res.json();
  return data.results || [];
}

export async function fetchByGenre(genreId: number, page = 1): Promise<TMDBMovie[]> {
  const res = await fetch(`${BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreId}&language=ar&page=${page}`);
  const data = await res.json();
  return data.results || [];
}

export async function fetchMovieDetail(id: number): Promise<TMDBMovie | null> {
  const res = await fetch(`${BASE}/movie/${id}?api_key=${TMDB_KEY}&language=ar`);
  if (!res.ok) return null;
  return res.json();
}

export async function searchMovies(query: string, page = 1): Promise<TMDBMovie[]> {
  const res = await fetch(`${BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=ar&page=${page}`);
  const data = await res.json();
  return data.results || [];
}

export async function fetchGenres(): Promise<TMDBGenre[]> {
  const res = await fetch(`${BASE}/genre/movie/list?api_key=${TMDB_KEY}&language=ar`);
  const data = await res.json();
  return data.genres || [];
}

export function posterUrl(path: string | null, size = 'w500'): string {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder.svg';
}

export function backdropUrl(path: string | null): string {
  return path ? `https://image.tmdb.org/t/p/original${path}` : '';
}
