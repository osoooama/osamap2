"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Calendar, Clock, Users, Play, ChevronLeft, Heart } from "lucide-react";
import { cn, JIKAN_BASE, type JikanAnime, type JikanEpisode, type JikanCharacter } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnimeDetailsProps {
  animeId: string;
}

export default function AnimeDetails({ animeId }: AnimeDetailsProps) {
  const [anime, setAnime] = useState<JikanAnime | null>(null);
  const [episodes, setEpisodes] = useState<JikanEpisode[]>([]);
  const [characters, setCharacters] = useState<JikanCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("episodes");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [animeRes, epRes, charRes] = await Promise.all([
          fetch(`${JIKAN_BASE}/anime/${animeId}/full`),
          fetch(`${JIKAN_BASE}/anime/${animeId}/episodes`),
          fetch(`${JIKAN_BASE}/anime/${animeId}/characters?limit=12`),
        ]);
        const [animeData, epData, charData] = await Promise.all([
          animeRes.json(),
          epRes.json(),
          charRes.json(),
        ]);
        if (mounted) {
          setAnime(animeData.data);
          setEpisodes(epData.data || []);
          setCharacters(charData.data || []);
        }
      } catch {}
      if (mounted) setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [animeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] animate-pulse">
        <div className="h-[40vh] bg-[#14141f]" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
          <div className="h-8 bg-[#14141f] rounded w-1/3 mb-4" />
          <div className="h-4 bg-[#14141f] rounded w-2/3 mb-2" />
          <div className="h-4 bg-[#14141f] rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-zinc-500">Anime not found</p>
      </div>
    );
  }

  const title = anime.title_english || anime.title;
  const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.webp?.large_image_url;
  const genres = anime.genres || [];
  const themes = anime.themes || [];
  const demographics = anime.demographics || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]" dir="ltr">
      <div className="relative h-[35vh] sm:h-[40vh] md:h-[45vh] overflow-hidden">
        {imageUrl && (
          <img src={imageUrl} alt="" className="w-full h-full object-cover object-top blur-sm scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-[#0a0a0f]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 -mt-32 sm:-mt-40">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0 w-40 sm:w-48 md:w-56 mx-auto sm:mx-0"
            >
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-2 ring-[#F47521]/20">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <div className="flex items-center gap-2 mb-2">
              {anime.score && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-yellow-500 text-sm font-bold">{anime.score}</span>
                </div>
              )}
              {anime.airing && (
                <span className="px-2 py-0.5 rounded bg-[#F47521]/20 border border-[#F47521]/30 text-[#F47521] text-xs font-bold">AIRING</span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
              {title}
            </h1>

            {anime.title_japanese && (
              <p className="text-zinc-500 text-sm mb-3">{anime.title_japanese}</p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-3">
              {genres.map((g) => (
                <span key={g.mal_id} className="px-2 py-0.5 rounded-full bg-[#F47521]/10 text-[#F47521] text-xs border border-[#F47521]/20">
                  {g.name}
                </span>
              ))}
              {themes.map((t) => (
                <span key={t.mal_id} className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 text-xs border border-white/10">
                  {t.name}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mb-4">
              {anime.type && <span>{anime.type}</span>}
              {anime.episodes && <span>{anime.episodes} episodes</span>}
              {anime.duration && <span>{anime.duration}</span>}
              {anime.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {anime.year}
                </span>
              )}
              {anime.status && <span>{anime.status}</span>}
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-[#F47521] text-white font-bold rounded-lg hover:bg-[#E06510] transition-all text-sm shadow-lg shadow-[#F47521]/20">
                <Play className="w-4 h-4 fill-white" />
                Watch Now
              </button>
              <button className="p-2.5 rounded-lg border bg-white/5 border-white/10 text-white hover:bg-white/10 transition">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 sm:mt-10">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#14141f] border border-white/5 mb-6">
              <TabsTrigger value="episodes" className="data-[state=active]:bg-[#F47521] data-[state=active]:text-white">
                Episodes ({episodes.length})
              </TabsTrigger>
              <TabsTrigger value="characters" className="data-[state=active]:bg-[#F47521] data-[state=active]:text-white">
                Characters ({characters.length})
              </TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:bg-[#F47521] data-[state=active]:text-white">
                Information
              </TabsTrigger>
            </TabsList>

            <TabsContent value="episodes">
              {episodes.length > 0 ? (
                <div className="space-y-2">
                  {episodes.map((ep) => (
                    <div
                      key={ep.mal_id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-[#14141f]/50 border border-white/5 hover:bg-[#14141f] hover:border-[#F47521]/20 transition-all cursor-pointer group"
                    >
                      <span className="text-zinc-600 text-sm font-mono w-8 text-right">{ep.number}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate group-hover:text-[#F47521] transition-colors">
                          {ep.title || `Episode ${ep.number}`}
                        </p>
                        {ep.aired && (
                          <p className="text-zinc-600 text-xs mt-0.5">{new Date(ep.aired).toLocaleDateString()}</p>
                        )}
                      </div>
                      {ep.score && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-yellow-500 text-xs">{ep.score}</span>
                        </div>
                      )}
                      <Play className="w-4 h-4 text-zinc-600 group-hover:text-[#F47521] transition-colors" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-600 text-sm text-center py-8">No episodes available</p>
              )}
            </TabsContent>

            <TabsContent value="characters">
              {characters.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {characters.map((char) => (
                    <div key={char.character.mal_id} className="text-center group">
                      <div className="aspect-square rounded-full overflow-hidden bg-[#14141f] mx-auto mb-2 ring-2 ring-white/5 group-hover:ring-[#F47521]/30 transition-all">
                        {char.character.images?.jpg?.image_url ? (
                          <img
                            src={char.character.images.jpg.image_url}
                            alt={char.character.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-zinc-700 text-xl">{char.character.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-white text-xs font-medium truncate">{char.character.name}</p>
                      <p className="text-zinc-600 text-[10px]">{char.role}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-600 text-sm text-center py-8">No character data available</p>
              )}
            </TabsContent>

            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-bold text-sm mb-3">Synopsis</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {anime.synopsis || "No synopsis available."}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#14141f]/50 border border-white/5">
                    <h4 className="text-white font-bold text-xs mb-2">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      {anime.scored_by && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Score</span>
                          <span className="text-white font-medium">{anime.score} ({anime.scored_by.toLocaleString()} votes)</span>
                        </div>
                      )}
                      {anime.rank && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Rank</span>
                          <span className="text-white font-medium">#{anime.rank}</span>
                        </div>
                      )}
                      {anime.popularity && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Popularity</span>
                          <span className="text-white font-medium">#{anime.popularity}</span>
                        </div>
                      )}
                      {anime.members && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Members</span>
                          <span className="text-white font-medium">{anime.members.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {anime.studios?.length > 0 && (
                    <div className="p-4 rounded-lg bg-[#14141f]/50 border border-white/5">
                      <h4 className="text-white font-bold text-xs mb-2">Studios</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {anime.studios.map((s) => (
                          <span key={s.mal_id} className="px-2 py-0.5 rounded bg-[#F47521]/10 text-[#F47521] text-xs">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {anime.source && (
                    <div className="p-4 rounded-lg bg-[#14141f]/50 border border-white/5">
                      <h4 className="text-white font-bold text-xs mb-2">Source</h4>
                      <p className="text-zinc-400 text-sm">{anime.source}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
