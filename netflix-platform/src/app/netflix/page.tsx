"use client";

import { useState, useCallback, useMemo } from "react";
import Billboard from "@/components/Billboard";
import MovieRow from "@/components/MovieRow";
import Top10Row from "@/components/Top10Row";
import GenrePills from "@/components/GenrePills";
import SearchBar from "@/components/SearchBar";
import InfoModal from "@/components/InfoModal";
import Footer from "@/components/Footer";
import Player, { PlayerContext } from "@/components/compound/Player";
import { useMovies, useTrending, usePopular, useTopRated, useNowPlaying } from "@/hooks/useMovies";
import { useContext } from "react";
import type { TMDBMovie } from "@/lib/tmdb";

const GENRE_MAP: Record<string, number[]> = {
  all: [],
  "28": [28, 12],
  "12": [12, 14],
  "35": [35],
  "18": [18],
  "27": [27],
  "878": [878],
  "10749": [10749],
  "53": [53, 80],
  "10751": [10751, 16],
  "99": [99],
  "16": [16],
};

function filterByGenre(movies: TMDBMovie[], genre: string): TMDBMovie[] {
  if (genre === "all") return movies;
  const ids = GENRE_MAP[genre] || [];
  if (ids.length === 0) return movies;
  return movies.filter((m) => {
    const movieIds = m.genre_ids || [];
    return ids.some((id) => movieIds.includes(id));
  });
}

function NetflixContent() {
  const { setShowPlayer, setTrailerKey } = useContext(PlayerContext);
  const { data: trending, isLoading: trendingLoading } = useTrending();
  const { data: popularMovies, isLoading: popularLoading } = useMovies(
    useCallback(() => import("@/lib/tmdb").then((m) => m.getPopular("movie")), [])
  );
  const { data: popularTv, isLoading: tvLoading } = useMovies(
    useCallback(() => import("@/lib/tmdb").then((m) => m.getPopular("tv")), [])
  );
  const { data: topRated, isLoading: topRatedLoading } = useTopRated();
  const { data: nowPlaying, isLoading: nowPlayingLoading } = useNowPlaying();

  const [selectedGenre, setSelectedGenre] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);

  const filteredMovies = useMemo(
    () => filterByGenre(popularMovies, selectedGenre),
    [popularMovies, selectedGenre]
  );
  const filteredTv = useMemo(
    () => filterByGenre(popularTv, selectedGenre),
    [popularTv, selectedGenre]
  );
  const filteredTopRated = useMemo(
    () => filterByGenre(topRated, selectedGenre),
    [topRated, selectedGenre]
  );
  const filteredNowPlaying = useMemo(
    () => filterByGenre(nowPlaying, selectedGenre),
    [nowPlaying, selectedGenre]
  );

  const top10 = useMemo(() => {
    const source = [...popularMovies].sort(
      (a, b) => (b?.vote_average || 0) - (a?.vote_average || 0)
    );
    return source.slice(0, 10);
  }, [popularMovies]);

  const isFiltered = selectedGenre !== "all";

  const handleOpenInfo = useCallback((movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setModalVisible(false);
    setSelectedMovie(null);
  }, []);

  const handlePlay = useCallback(
    async (movie: TMDBMovie) => {
      const { getTrailer } = await import("@/lib/tmdb");
      const key = await getTrailer(movie.id, (movie.media_type as "movie" | "tv") || "movie");
      if (key) {
        setTrailerKey(key);
        setShowPlayer(true);
      }
    },
    [setTrailerKey, setShowPlayer]
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent">
        <div className="flex items-center justify-between px-4 sm:px-8 md:px-12 lg:px-16 py-3">
          <div className="flex items-center gap-6 sm:gap-8">
            <span className="text-xl sm:text-2xl font-black text-[#E50914] tracking-tighter">
              NETFLIX
            </span>
            <nav className="hidden sm:flex items-center gap-4">
              <button className="text-white text-sm font-bold">الرئيسية</button>
              <button className="text-zinc-400 hover:text-white text-sm transition-colors">أفلام</button>
              <button className="text-zinc-400 hover:text-white text-sm transition-colors">مسلسلات</button>
              <button className="text-zinc-400 hover:text-white text-sm transition-colors">جديد وحصري</button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar onPlay={handlePlay} onInfo={handleOpenInfo} />
          </div>
        </div>
      </div>

      {/* Billboard */}
      <Billboard
        movies={popularMovies}
        isLoading={popularLoading}
        onPlay={handlePlay}
        onInfo={handleOpenInfo}
      />

      {/* Content */}
      <div className="relative z-10 -mt-10 sm:-mt-14 md:-mt-20">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-12 sm:pb-16 space-y-5 sm:space-y-8">
          <GenrePills selected={selectedGenre} onSelect={setSelectedGenre} />

          {!isFiltered && top10.length > 0 && (
            <Top10Row
              title="Top 10 اليوم"
              subtitle="الأكثر مشاهدة"
              movies={top10}
              accentColor="#E50914"
              onInfo={handleOpenInfo}
            />
          )}

          {filteredNowPlaying.length > 0 && (
            <MovieRow
              title={isFiltered ? `أفلام` : "يُعرض الآن"}
              subtitle={isFiltered ? "نتائج التصفية" : "الأفلام الحالية في السينما"}
              movies={filteredNowPlaying}
              accentColor="#E50914"
              loading={nowPlayingLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          )}

          {filteredMovies.length > 0 && (
            <MovieRow
              title={isFiltered ? "نتائج التصفية" : "أفلام عالمية"}
              subtitle={isFiltered ? "" : "الأكثر مشاهدة هذا الأسبوع"}
              movies={filteredMovies}
              accentColor="#E50914"
              loading={popularLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          )}

          {filteredTv.length > 0 && (
            <MovieRow
              title={isFiltered ? "نتائج التصفية" : "مسلسلات عالمية"}
              subtitle={isFiltered ? "" : "أشهر المسلسلات"}
              movies={filteredTv}
              accentColor="#E50914"
              loading={tvLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          )}

          {filteredTopRated.length > 0 && (
            <MovieRow
              title="الأكثر تقييماً"
              subtitle="أفضل الأفلام والمسلسلات"
              movies={filteredTopRated}
              accentColor="#E50914"
              loading={topRatedLoading}
              onInfo={handleOpenInfo}
              onPlay={handlePlay}
            />
          )}

          {!popularLoading && filteredMovies.length === 0 && filteredTv.length === 0 && isFiltered && (
            <div className="text-center py-16">
              <p className="text-zinc-500 text-sm">لا توجد نتائج لهذا التصنيف</p>
              <p className="text-zinc-600 text-xs mt-1">جرّب تصنيفاً آخر</p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <InfoModal
        visible={modalVisible}
        onClose={handleCloseInfo}
        movie={selectedMovie}
        accentColor="#E50914"
        onPlay={handlePlay}
      />

      <Player.Overlay />
    </div>
  );
}

export default function NetflixPage() {
  return (
    <Player>
      <NetflixContent />
    </Player>
  );
}
