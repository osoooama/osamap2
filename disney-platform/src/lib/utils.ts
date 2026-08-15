import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "";
  const base = process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || "https://image.tmdb.org/t/p";
  return `${base}/${size}${path}`;
}

export function getBackdropUrl(path: string | null): string {
  return getImageUrl(path, "original");
}

export function getPosterUrl(path: string | null): string {
  return getImageUrl(path, "w500");
}

export function getMatchPercent(voteAverage: number): number {
  return Math.round(voteAverage * 10);
}

export function getYear(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  return dateStr.slice(0, 4);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "...";
}
