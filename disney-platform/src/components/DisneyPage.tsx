"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  type TMDBMovie,
  getDisneyOriginals,
  getDisneyMovies,
  getMarvelMovies,
  getStarWarsMovies,
  getNatGeoMovies,
  getDisneyTV,
  searchMulti,
} from "@/lib/tmdb";
import Navbar from "@/components/Navbar";
import Banner from "@/components/Banner";
import MovieRow from "@/components/MovieRow";
import BrandRow from "@/components/BrandRow";
import SearchBar from "@/components/SearchBar";
import InfoModal from "@/components/InfoModal";
import Footer from "@/components/Footer";

const BRAND_ROWS = [
  { title: "أفلام ديزني الأصلية", fetcher: getDisneyOriginals },
  { title: "مارفل", fetcher: getMarvelMovies },
  { title: "ستار وورز", fetcher: getStarWarsMovies },
  { title: "ناشيونال جيوغرافيك", fetcher: getNatGeoMovies },
  { title: "مسلسلات ديزني", fetcher: getDisneyTV },
  { title: "أفلام ديزني", fetcher: getDisneyMovies },
];

interface RowState {
  data: TMDBMovie[];
  loading: boolean;
}

export default function DisneyPage() {
  const [heroMovies, setHeroMovies] = useState<TMDBMovie[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadHero = async () => {
      try {
        const data = await getDisneyOriginals();
        if (mounted) setHeroMovies(data);
      } catch {}
      if (mounted) setHeroLoading(false);
    };

    const loadRows = async () => {
      for (const { title, fetcher } of BRAND_ROWS) {
        setRows((prev) => ({ ...prev, [title]: { data: [], loading: true } }));
        try {
          const data = await fetcher();
          if (mounted) setRows((prev) => ({ ...prev, [title]: { data, loading: false } }));
        } catch {
          if (mounted) setRows((prev) => ({ ...prev, [title]: { data: [], loading: false } }));
        }
      }
    };

    loadHero();
    loadRows();

    return () => { mounted = false; };
  }, []);

  const handlePlay = useCallback((movie: TMDBMovie) => {
    const id = movie.id;
    const type = movie.media_type || "movie";
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title || movie.name || "")} trailer`, "_blank");
  }, []);

  const handleInfo = useCallback((movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setShowModal(true);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    setShowSearch(true);
    const results = await searchMulti(query);
    setSearchResults(results);
  }, []);

  return (
    <div className="min-h-screen bg-[#0C111B] text-white font-[Tajawal,sans-serif]">
      <Navbar className="absolute top-0 left-0 right-0 z-40" />
      <SearchBar className="absolute top-3 left-4 z-50" />

      <main>
        <Banner
          movies={heroMovies}
          isLoading={heroLoading}
          onPlay={handlePlay}
          onInfo={handleInfo}
        />

        <div className="relative z-10 -mt-24 sm:-mt-32 md:-mt-40 pb-8">
          <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
            {BRAND_ROWS.map(({ title }) => {
              const row = rows[title];
              return (
                <MovieRow
                  key={title}
                  title={title}
                  movies={row?.data || []}
                  loading={row?.loading}
                  onPlay={handlePlay}
                  onInfo={handleInfo}
                />
              );
            })}
          </div>
        </div>
      </main>

      <Footer />

      <InfoModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        movie={selectedMovie}
        onPlay={handlePlay}
      />
    </div>
  );
}
