import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const JIKAN_BASE = "https://api.jikan.moe/v4";

export interface JikanImage {
  image_url: string;
  large_image_url: string;
  small_image_url: string;
}

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  images: { jpg: JikanImage; webp: JikanImage };
  type: string;
  source: string;
  episodes: number | null;
  status: string;
  airing: boolean;
  aired: { from: string; to: string | null; string: string };
  duration: string;
  rating: string;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  broadcast: { day: string; time: string; timezone: string; string: string };
  genres: { mal_id: number; name: string; type: string }[];
  themes: { mal_id: number; name: string; type: string }[];
  demographics: { mal_id: number; name: string; type: string }[];
  producers: { mal_id: number; name: string; type: string }[];
  licensors: { mal_id: number; name: string; type: string }[];
  studios: { mal_id: number; name: string; type: string }[];
  explicit_genres: any[];
  relations: any[];
  theme: any[];
  external: any[];
  streaming: { name: string; url: string }[];
}

export interface JikanEpisode {
  mal_id: number;
  url: string;
  number: number;
  title: string | null;
  title_japanese: string | null;
  title_romanji: string | null;
  aired: string;
  score: number | null;
  filler: boolean;
  recap: boolean;
  forum_url: string;
}

export interface JikanCharacter {
  character: {
    mal_id: number;
    url: string;
    images: { jpg: JikanImage; webp: JikanImage };
    name: string;
    name_kanji: string | null;
    nicknames: string[];
    favorites: number;
  };
  role: string;
  voice_actors: {
    person: {
      mal_id: number;
      url: string;
      images: { jpg: JikanImage };
      name: string;
    };
    language: string;
  }[];
}

export interface JikanPagination {
  last_visible_page: number;
  has_previous_page: boolean;
  current_page: number;
  items: { count: number; total: number; per_page: number };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: JikanPagination;
}
