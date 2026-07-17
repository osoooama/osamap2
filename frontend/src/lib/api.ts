import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

export default api;

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';

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
    const params: any = { type: mediaType };
    if (season) params.season = season;
    if (episode) params.episode = episode;
    const { data } = await api.get(`/api/subtitles/${tmdbId}`, { params });
    return data.subtitles || [];
  } catch {
    return [];
  }
}
