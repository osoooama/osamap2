import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

export default api;

interface MoviesResponse {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  totalPages: number;
}

interface SearchResponse {
  local: Record<string, unknown>[];
  tmdb: Record<string, unknown>[];
}

export async function getMovies(category: string, page = 1, type?: string): Promise<MoviesResponse> {
  const params: Record<string, string | number> = { page };
  if (type) params.type = type;
  const { data } = await api.get(`/api/movies/category/${category}`, { params });
  return data;
}

export async function getMovieDetails(tmdb_id: string): Promise<Record<string, unknown>> {
  const { data } = await api.get(`/api/movies/details/${tmdb_id}`);
  return data;
}

export async function searchMovies(query: string, category?: string): Promise<SearchResponse> {
  const { data } = await api.get('/api/movies/search', { params: { q: query, category } });
  return data;
}

export async function getTMDBTrailer(tmdbId: string, mediaType: 'movie' | 'tv' = 'movie'): Promise<string | null> {
  try {
    const { data } = await api.get(`/api/tmdb/trailer/${tmdbId}`, { params: { type: mediaType } });
    return data.key || null;
  } catch {
    return null;
  }
}

export interface Subtitle {
  lang: string;
  lang_name: string;
  url: string;
  format: string;
  encoding: string;
  source: string;
  flag_url: string;
}

export async function getSubtitles(tmdbId: string, mediaType = 'movie', season?: number, episode?: number): Promise<Subtitle[]> {
  try {
    const params: Record<string, string | number> = { type: mediaType };
    if (season) params.season = season;
    if (episode) params.episode = episode;
    const { data } = await api.get(`/api/subtitles/${tmdbId}`, { params });
    return data.subtitles || [];
  } catch {
    return [];
  }
}
