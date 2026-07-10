import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

export default api;

export async function getMovies(category: string, page = 1) {
  const { data } = await api.get(`/api/movies/category/${category}`, { params: { page } });
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
