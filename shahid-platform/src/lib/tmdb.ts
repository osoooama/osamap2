const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";

export interface TMDBMovie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  media_type?: string;
  original_language?: string;
  origin_country?: string[];
  popularity?: number;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}): Promise<TMDBResponse> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY || "");
  url.searchParams.set("language", "ar-SA");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

export async function getArabicMovies(page = 1): Promise<TMDBMovie[]> {
  const data = await fetchTMDB("/discover/movie", {
    with_original_language: "ar",
    sort_by: "popularity.desc",
    page: String(page),
  });
  return data.results;
}

export async function getArabicTV(page = 1): Promise<TMDBMovie[]> {
  const data = await fetchTMDB("/discover/tv", {
    with_original_language: "ar",
    sort_by: "popularity.desc",
    page: String(page),
  });
  return data.results;
}

export async function getTurkishMovies(page = 1): Promise<TMDBMovie[]> {
  const data = await fetchTMDB("/discover/movie", {
    with_original_language: "tr",
    sort_by: "popularity.desc",
    page: String(page),
  });
  return data.results;
}

export async function getTurkishTV(page = 1): Promise<TMDBMovie[]> {
  const data = await fetchTMDB("/discover/tv", {
    with_original_language: "tr",
    sort_by: "popularity.desc",
    page: String(page),
  });
  return data.results;
}

export async function getTrending(timeWindow: "day" | "week" = "week"): Promise<TMDBMovie[]> {
  const data = await fetchTMDB(`/trending/all/${timeWindow}`);
  return data.results;
}

export async function searchMulti(query: string): Promise<TMDBMovie[]> {
  if (!query.trim()) return [];
  const data = await fetchTMDB("/search/multi", { query, include_adult: "false" });
  return data.results.filter(
    (r) =>
      (r.media_type === "movie" || r.media_type === "tv") &&
      (r.original_language === "ar" || r.original_language === "tr")
  );
}

export async function getTrailer(tmdbId: number, mediaType: "movie" | "tv" = "movie"): Promise<string | null> {
  try {
    const url = `${TMDB_BASE}/${mediaType}/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=en-US`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const trailer = data.results?.find(
      (v: { type: string; site: string }) => v.type === "Trailer" && v.site === "YouTube"
    );
    return trailer?.key || data.results?.[0]?.key || null;
  } catch {
    return null;
  }
}

export const ARABIC_GENRES: Record<number, string> = {
  28: "أكشن", 12: "مغامرة", 16: "أنيميشن", 35: "كوميدي", 80: "جريمة",
  99: "وثائقي", 18: "دراما", 10751: "عائلي", 14: "فانتازيا", 27: "رعب",
  10749: "رومانسي", 878: "خيال علمي", 53: "إثارة", 10752: "حرب",
};
