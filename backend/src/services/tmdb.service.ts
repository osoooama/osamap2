import axios from 'axios';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function getMovieDetails(tmdb_id: string) {
  const { data } = await axios.get(`${TMDB_BASE}/movie/${tmdb_id}`, {
    params: { api_key: process.env.TMDB_API_KEY, language: 'ar' },
  });
  return data;
}

export async function getMovieImages(tmdb_id: string) {
  const { data } = await axios.get(`${TMDB_BASE}/movie/${tmdb_id}/images`, {
    params: { api_key: process.env.TMDB_API_KEY },
  });
  return data;
}
