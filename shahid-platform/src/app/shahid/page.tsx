"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Banner from "@/components/Banner";
import MovieRow from "@/components/MovieRow";
import SearchBar from "@/components/SearchBar";
import InfoModal from "@/components/InfoModal";
import Footer from "@/components/Footer";
import { useArabicContent, useTurkishContent, useTrending } from "@/hooks/useContent";
import type { TMDBMovie } from "@/lib/tmdb";

export default function ShahidPage() {
  const { movies: arabicMovies, tv: arabicTV, moviesLoading, tvLoading } = useArabicContent();
  const { movies: turkishMovies, tv: turkishTV, moviesLoading: trLoading, tvLoading: trTvLoading } = useTurkishContent();
  const { data: trending, isLoading: trendingLoading } = useTrending();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);

  const handleOpenInfo = useCallback((movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setModalVisible(false);
    setSelectedMovie(null);
  }, []);

  const handlePlay = useCallback(async (movie: TMDBMovie) => {
    const { getTrailer } = await import("@/lib/tmdb");
    const key = await getTrailer(movie.id, (movie.media_type as "movie" | "tv") || "movie");
    if (key) {
      window.open(`https://www.youtube.com/watch?v=${key}`, "_blank");
    }
  }, []);

  const topArabicMovies = [...arabicMovies].sort((a, b) => (b?.vote_average || 0) - (a?.vote_average || 0)).slice(0, 10);
  const topTurkishMovies = [...turkishMovies].sort((a, b) => (b?.vote_average || 0) - (a?.vote_average || 0)).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#060F0A]" dir="rtl">
      <div className="sticky top-0 z-40">
        <div className="bg-[#0A2818]/95 backdrop-blur-xl border-b border-[#C9A96E]/5">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A96E] to-[#B8944F] flex items-center justify-center shadow-lg shadow-[#C9A96E]/20">
                <span className="text-[#0A2818] text-sm font-black">ش</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-white tracking-tight">شاهد</span>
            </div>
            <SearchBar onPlay={handlePlay} onInfo={handleOpenInfo} />
          </div>
        </div>
      </div>

      <Banner
        movies={arabicMovies}
        isLoading={moviesLoading}
        onPlay={handlePlay}
        onInfo={handleOpenInfo}
      />

      <div className="relative z-10 -mt-10 sm:-mt-14 md:-mt-20">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-5 sm:space-y-8">
          {topArabicMovies.length > 0 && (
            <MovieRow
              title="الأكثر تقييماً في العالم العربي"
              subtitle="أفضل الأفلام العربية"
              movies={topArabicMovies}
              loading={moviesLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          )}

          {arabicMovies.length > 0 && (
            <MovieRow
              title="أفلام عربية"
              subtitle="أحدث الأفلام العربية"
              movies={arabicMovies}
              loading={moviesLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          )}

          {arabicTV.length > 0 && (
            <MovieRow
              title="مسلسلات عربية"
              subtitle="أشهر المسلسلات العربية"
              movies={arabicTV}
              loading={tvLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          )}

          {topTurkishMovies.length > 0 && (
            <MovieRow
              title="الأكثر تقييماً في تركيا"
              subtitle="أفضل الأفلام التركية"
              movies={topTurkishMovies}
              loading={trLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          )}

          {turkishMovies.length > 0 && (
            <MovieRow
              title="أفلام تركية"
              subtitle="أحدث الأفلام التركية"
              movies={turkishMovies}
              loading={trLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          )}

          {turkishTV.length > 0 && (
            <MovieRow
              title="مسلسلات تركية"
              subtitle="أشهر المسلسلات التركية"
              movies={turkishTV}
              loading={trTvLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          )}

          {!moviesLoading && arabicMovies.length === 0 && turkishMovies.length === 0 && (
            <div className="text-center py-16">
              <p className="text-zinc-500 text-sm">جاري تحميل المحتوى...</p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <InfoModal
        visible={modalVisible}
        onClose={handleCloseInfo}
        movie={selectedMovie}
        onPlay={handlePlay}
      />
    </div>
  );
}
