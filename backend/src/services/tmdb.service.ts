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

const CATEGORY_MAP: Record<string, string> = {
  foreign: 'popular',
  arabic: 'ar',
  turkish: 'tr',
  anime: 'anime',
  animation: 'animation',
};

export async function discoverByCategory(category: string, page = 1) {
  const map = CATEGORY_MAP[category];
  if (!map) return [];

  if (category === 'foreign' || (category !== 'arabic' && category !== 'turkish' && category !== 'anime' && category !== 'animation')) {
    const { data } = await axios.get(`${TMDB_BASE}/movie/popular`, {
      params: { api_key: process.env.TMDB_API_KEY, language: 'ar', page },
    });
    return data.results || [];
  }

  if (category === 'arabic') {
    const { data } = await axios.get(`${TMDB_BASE}/discover/movie`, {
      params: { api_key: process.env.TMDB_API_KEY, language: 'ar', with_original_language: 'ar', sort_by: 'popularity.desc', page },
    });
    return data.results || [];
  }

  if (category === 'turkish') {
    const { data } = await axios.get(`${TMDB_BASE}/discover/tv`, {
      params: { api_key: process.env.TMDB_API_KEY, language: 'tr', with_original_language: 'tr', sort_by: 'popularity.desc', page },
    });
    return data.results || [];
  }

  if (category === 'anime') {
    const { data } = await axios.get(`${TMDB_BASE}/discover/movie`, {
      params: { api_key: process.env.TMDB_API_KEY, language: 'ja', with_keywords: '210024', sort_by: 'popularity.desc', page },
    });
    return data.results || [];
  }

  if (category === 'animation') {
    const { data } = await axios.get(`${TMDB_BASE}/discover/movie`, {
      params: { api_key: process.env.TMDB_API_KEY, language: 'ar', with_genres: '16', sort_by: 'popularity.desc', page },
    });
    return data.results || [];
  }

  return [];
}

export async function getMovieTrailer(tmdb_id: string): Promise<string | null> {
  try {
    const { data } = await axios.get(`${TMDB_BASE}/movie/${tmdb_id}/videos`, {
      params: { api_key: process.env.TMDB_API_KEY, language: 'en' },
    });
    const trailer = (data.results || []).find(
      (v: any) => v.type === 'Trailer' && v.site === 'YouTube' && v.official === true
    );
    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  } catch {
    return null;
  }
}
