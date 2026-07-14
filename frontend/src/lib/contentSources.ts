const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';

export interface ExternalMovie {
  id: number;
  tmdb_id: number;
  imdb_id?: string;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type: 'movie';
}

export interface ExternalTVShow {
  id: number;
  tmdb_id: number;
  imdb_id?: string;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type: 'tv';
}

export interface AnimeEntry {
  id: number;
  anilist_id: number;
  mal_id?: number;
  title: string;
  title_japanese?: string;
  overview: string;
  cover_image: string;
  banner_image?: string;
  episodes?: number;
  status: string;
  score?: number;
  genres: string[];
  media_type: 'anime';
}

function stripHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|form)[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

export async function fetchTrending(category: 'movie' | 'tv' = 'movie', timeWindow: 'day' | 'week' = 'week'): Promise<ExternalMovie[] | ExternalTVShow[]> {
  const res = await fetch(`${TMDB_BASE}/trending/${category}/${timeWindow}?api_key=${TMDB_KEY}&language=ar`);
  if (!res.ok) throw new Error('Failed to fetch trending');
  const data = await res.json();
  return data.results || [];
}

export async function fetchTopRated(category: 'movie' | 'tv' = 'movie'): Promise<ExternalMovie[] | ExternalTVShow[]> {
  const res = await fetch(`${TMDB_BASE}/${category}/top_rated?api_key=${TMDB_KEY}&language=ar&page=1`);
  if (!res.ok) throw new Error('Failed to fetch top rated');
  const data = await res.json();
  return data.results || [];
}

export async function searchTMDB(query: string, category?: 'movie' | 'tv'): Promise<(ExternalMovie | ExternalTVShow)[]> {
  const multi = !category;
  const endpoint = multi ? 'search/multi' : `search/${category}`;
  const res = await fetch(`${TMDB_BASE}/${endpoint}?api_key=${TMDB_KEY}&language=ar&query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return (data.results || []).filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv');
}

export async function fetchAniListTrending(page = 1, perPage = 20): Promise<AnimeEntry[]> {
  const query = `query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
        id
        idMal
        title { romaji english native }
        description(asHtml: false)
        coverImage { large }
        bannerImage
        episodes
        status
        meanScore
        genres
        externalLinks { site url }
      }
    }
  }`;

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { page, perPage } }),
  });

  if (!res.ok) throw new Error('AniList API error');
  const data = await res.json();

  return (data.data?.Page?.media || []).map((m: any) => ({
    id: m.id,
    anilist_id: m.id,
    mal_id: m.idMal,
    title: m.title.english || m.title.romaji || '',
    title_japanese: m.title.native || '',
    overview: stripHtml(m.description || '').substring(0, 300),
    cover_image: m.coverImage?.large || '',
    banner_image: m.bannerImage || '',
    episodes: m.episodes,
    status: m.status,
    score: m.meanScore ? m.meanScore / 10 : undefined,
    genres: m.genres || [],
    media_type: 'anime' as const,
  }));
}

export async function searchAniList(keyword: string, page = 1): Promise<AnimeEntry[]> {
  const query = `query ($search: String, $page: Int) {
    Page(page: $page, perPage: 20) {
      media(search: $search, type: ANIME, isAdult: false) {
        id
        idMal
        title { romaji english native }
        description(asHtml: false)
        coverImage { large }
        bannerImage
        episodes
        status
        meanScore
        genres
      }
    }
  }`;

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { search: keyword, page } }),
  });

  if (!res.ok) throw new Error('AniList search failed');
  const data = await res.json();

  return (data.data?.Page?.media || []).map((m: any) => ({
    id: m.id,
    anilist_id: m.id,
    mal_id: m.idMal,
    title: m.title.english || m.title.romaji || '',
    title_japanese: m.title.native || '',
    overview: stripHtml(m.description || '').substring(0, 300),
    cover_image: m.coverImage?.large || '',
    banner_image: m.bannerImage || '',
    episodes: m.episodes,
    status: m.status,
    score: m.meanScore ? m.meanScore / 10 : undefined,
    genres: m.genres || [],
    media_type: 'anime' as const,
  }));
}

export async function fetchAniListById(id: number): Promise<AnimeEntry | null> {
  const query = `query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title { romaji english native }
      description(asHtml: false)
      coverImage { large }
      bannerImage
      episodes
      status
      meanScore
      genres
    }
  }`;

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id } }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const m = data.data?.Media;
  if (!m) return null;

  return {
    id: m.id,
    anilist_id: m.id,
    mal_id: m.idMal,
    title: m.title.english || m.title.romaji || '',
    title_japanese: m.title.native || '',
    overview: stripHtml(m.description || '').substring(0, 300),
    cover_image: m.coverImage?.large || '',
    banner_image: m.bannerImage || '',
    episodes: m.episodes,
    status: m.status,
    score: m.meanScore ? m.meanScore / 10 : undefined,
    genres: m.genres || [],
    media_type: 'anime',
  };
}

export function getGenreName(id: number): string {
  return GENRE_MAP[id] || 'Unknown';
}

export function getGenreNames(ids: number[]): string {
  return ids.map(getGenreName).join(', ');
}
