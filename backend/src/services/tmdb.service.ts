import axios from 'axios';

const TMDB_BASE = 'https://api.themoviedb.org/3';

function validateTmdbId(id: string): string {
  if (!/^\d+$/.test(id)) throw new Error('Invalid TMDB ID');
  return id;
}

export async function getMovieDetails(tmdb_id: string) {
  const { data } = await axios.get(`${TMDB_BASE}/movie/${validateTmdbId(tmdb_id)}`, {
    params: { api_key: process.env.TMDB_API_KEY, language: 'ar' },
  });
  return data;
}

export async function getTVDetails(tmdb_id: string) {
  const { data } = await axios.get(`${TMDB_BASE}/tv/${validateTmdbId(tmdb_id)}`, {
    params: { api_key: process.env.TMDB_API_KEY, language: 'ar' },
  });
  return data;
}

export async function getTVSeasonDetails(tmdb_id: string, season: number) {
  const { data } = await axios.get(`${TMDB_BASE}/tv/${validateTmdbId(tmdb_id)}/season/${season}`, {
    params: { api_key: process.env.TMDB_API_KEY, language: 'ar' },
  });
  return data;
}

interface CategorySource {
  type: 'movie' | 'tv';
  url: string;
  params: Record<string, string | number>;
}

const CATEGORY_SOURCES: Record<string, CategorySource[]> = {
  foreign: [
    { type: 'movie', url: '/movie/popular', params: { language: 'ar' } },
    { type: 'movie', url: '/movie/top_rated', params: { language: 'ar' } },
    { type: 'movie', url: '/movie/now_playing', params: { language: 'ar' } },
    { type: 'movie', url: '/trending/movie/week', params: { language: 'ar' } },
    { type: 'tv', url: '/tv/popular', params: { language: 'ar' } },
    { type: 'tv', url: '/tv/top_rated', params: { language: 'ar' } },
    { type: 'tv', url: '/trending/tv/week', params: { language: 'ar' } },
  ],
  arabic: [
    { type: 'movie', url: '/discover/movie', params: { with_original_language: 'ar', sort_by: 'popularity.desc', language: 'ar' } },
    { type: 'movie', url: '/discover/movie', params: { with_original_language: 'ar', sort_by: 'vote_count.desc', language: 'ar' } },
    { type: 'tv', url: '/discover/tv', params: { with_original_language: 'ar', sort_by: 'popularity.desc', language: 'ar' } },
    { type: 'tv', url: '/discover/tv', params: { with_original_language: 'ar', sort_by: 'vote_count.desc', language: 'ar' } },
  ],
  turkish: [
    { type: 'tv', url: '/discover/tv', params: { with_original_language: 'tr', sort_by: 'popularity.desc', language: 'ar' } },
    { type: 'tv', url: '/discover/tv', params: { with_original_language: 'tr', sort_by: 'vote_count.desc', language: 'ar' } },
    { type: 'movie', url: '/discover/movie', params: { with_original_language: 'tr', sort_by: 'popularity.desc', language: 'ar' } },
  ],
  anime: [
    { type: 'movie', url: '/discover/movie', params: { with_keywords: '210024', sort_by: 'popularity.desc', language: 'ar' } },
    { type: 'tv', url: '/discover/tv', params: { with_keywords: '210024', sort_by: 'popularity.desc', language: 'ar' } },
    { type: 'movie', url: '/discover/movie', params: { with_genres: '16', sort_by: 'popularity.desc', language: 'ar' } },
    { type: 'tv', url: '/discover/tv', params: { with_genres: '16', sort_by: 'popularity.desc', language: 'ar' } },
    { type: 'movie', url: '/trending/movie/week', params: { language: 'ar' } },
    { type: 'tv', url: '/trending/tv/week', params: { language: 'ar' } },
  ],
  animation: [
    { type: 'movie', url: '/discover/movie', params: { with_genres: '16', sort_by: 'popularity.desc', language: 'ar' } },
    { type: 'movie', url: '/discover/movie', params: { with_genres: '16', sort_by: 'vote_count.desc', language: 'ar' } },
    { type: 'tv', url: '/discover/tv', params: { with_genres: '16', sort_by: 'popularity.desc', language: 'ar' } },
  ],
};

export async function discoverByCategory(category: string, page = 1) {
  const sources = CATEGORY_SOURCES[category];
  if (!sources) return [];

  const results: any[] = [];
  const seen = new Set<string>();

  for (const source of sources) {
    try {
      const { data } = await axios.get(`${TMDB_BASE}${source.url}`, {
        params: { ...source.params, api_key: process.env.TMDB_API_KEY, page },
      });
      const items = (data.results || []).slice(0, 6);
      for (const item of items) {
        const id = String(item.id);
        if (!seen.has(id)) {
          seen.add(id);
          results.push({ ...item, media_type: source.type, tmdb_id: id });
        }
      }
    } catch {
      // skip failed source
    }
  }

  return results.slice(0, 50);
}

export async function seedAllCategories() {
  const categories = ['foreign', 'arabic', 'turkish', 'anime', 'animation'];
  const allResults: Record<string, any[]> = {};

  for (const category of categories) {
    const sources = CATEGORY_SOURCES[category];
    if (!sources) continue;

    const seen = new Map<string, any>();

    for (const source of sources) {
      for (let p = 1; p <= 5; p++) {
        try {
          const { data } = await axios.get(`${TMDB_BASE}${source.url}`, {
            params: { ...source.params, api_key: process.env.TMDB_API_KEY, page: p },
          });
          const items = data.results || [];
          for (const item of items) {
            const id = String(item.id);
            if (!seen.has(id)) {
              seen.set(id, {
                tmdb_id: id,
                title: item.title || item.name || 'غير معروف',
                overview: item.overview || '',
                poster_path: item.poster_path || '',
                backdrop_path: item.backdrop_path || '',
                media_type: source.type,
                category,
                vote_average: item.vote_average || 0,
                release_date: item.release_date || item.first_air_date || '',
                genre_ids: item.genre_ids || [],
                original_language: item.original_language || '',
                popularity: item.popularity || 0,
              });
            }
          }
        } catch {
          // skip failed page
        }
      }
    }

    allResults[category] = [...seen.values()];
  }

  return allResults;
}

export async function seedCategoryFull(category: string, maxPages = 10) {
  const sources = CATEGORY_SOURCES[category];
  if (!sources) return [];

  const seen = new Map<string, any>();

  for (const source of sources) {
    for (let p = 1; p <= maxPages; p++) {
      try {
        const { data } = await axios.get(`${TMDB_BASE}${source.url}`, {
          params: { ...source.params, api_key: process.env.TMDB_API_KEY, page: p },
        });
        const items = data.results || [];
        if (items.length === 0) break;
        for (const item of items) {
          const id = String(item.id);
          if (!seen.has(id)) {
            seen.set(id, {
              tmdb_id: id,
              title: item.title || item.name || 'Unknown',
              overview: item.overview || '',
              poster_path: item.poster_path || '',
              backdrop_path: item.backdrop_path || '',
              media_type: source.type,
              category,
              vote_average: item.vote_average || 0,
              release_date: item.release_date || item.first_air_date || '',
              genre_ids: item.genre_ids || [],
              original_language: item.original_language || '',
              popularity: item.popularity || 0,
            });
          }
        }
      } catch {
        break; // stop paginating this source on error
      }
    }
  }

  return [...seen.values()];
}

export async function searchTMDB(query: string) {
  const [movies, tv] = await Promise.allSettled([
    axios.get(`${TMDB_BASE}/search/movie`, { params: { api_key: process.env.TMDB_API_KEY, query, language: 'ar' } }),
    axios.get(`${TMDB_BASE}/search/tv`, { params: { api_key: process.env.TMDB_API_KEY, query, language: 'ar' } }),
  ]);

  const movieResults = movies.status === 'fulfilled' ? (movies.value.data.results || []).slice(0, 10) : [];
  const tvResults = tv.status === 'fulfilled' ? (tv.value.data.results || []).slice(0, 10) : [];

  return [
    ...movieResults.map((r: any) => ({ ...r, media_type: 'movie' })),
    ...tvResults.map((r: any) => ({ ...r, media_type: 'tv' })),
  ];
}
