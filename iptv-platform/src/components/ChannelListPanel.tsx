"use client";

import { useMemo } from "react";
import { Search, Star, StarOff, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { ChannelListItem } from "./ChannelListItem";
import { useFavorites } from "@/hooks/useFavorites";
import type { ChannelCategory, ChannelStream } from "@/types/xtream";

interface ChannelListPanelProps {
  selectedCategory: ChannelCategory | undefined;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showChannelFavorites: boolean;
  onToggleChannelFavorites: () => void;
  isChannelPanelCollapsed: boolean;
  onToggleChannelPanelCollapsed: () => void;
  onPlayStream: (stream: ChannelStream) => void;
  activeStreamId: string | null;
}

export const ChannelListPanel = ({
  selectedCategory,
  searchTerm,
  onSearchChange,
  showChannelFavorites,
  onToggleChannelFavorites,
  isChannelPanelCollapsed,
  onToggleChannelPanelCollapsed,
  onPlayStream,
  activeStreamId,
}: ChannelListPanelProps) => {
  const { isChannelFavorite, toggleChannelFavorite, getFavoriteChannels } = useFavorites();

  const filteredStreams = useMemo(() => {
    if (!selectedCategory) return [] as ChannelStream[];
    let streams = selectedCategory.streams;
    const term = searchTerm.trim().toLowerCase();
    if (term) streams = streams.filter((s) => s.name.toLowerCase().includes(term));

    const favs = getFavoriteChannels(streams);
    const nonFavs = streams.filter((s) => !favs.some((f) => f.id === s.id));

    if (showChannelFavorites) return favs;
    return [...favs, ...nonFavs];
  }, [selectedCategory, searchTerm, showChannelFavorites, getFavoriteChannels]);

  return (
    <aside
      className={clsx(
        "fixed lg:static inset-y-0 right-0 z-40 bg-surface-light/95 backdrop-blur-xl border-l border-primary/5 transition-all duration-300 ease-in-out shadow-2xl shadow-black/50 lg:shadow-none pt-14 lg:pt-0",
        isChannelPanelCollapsed ? "translate-x-full lg:translate-x-0" : "translate-x-0",
        isChannelPanelCollapsed ? "w-14" : "w-[80vw] max-w-xs sm:w-80 lg:w-72"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          {!isChannelPanelCollapsed && (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-white truncate font-arabic">
                  {selectedCategory?.name || "القنوات"}
                </h2>
                <button
                  onClick={onToggleChannelFavorites}
                  className={clsx(
                    "rounded-lg p-1.5 transition-all",
                    showChannelFavorites
                      ? "bg-primary/20 text-primary border border-primary/20"
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  {showChannelFavorites ? <Star className="h-3.5 w-3.5" /> : <StarOff className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="بحث عن قناة..."
                  className="w-full rounded-xl border border-white/5 bg-surface/60 py-2 pl-8 pr-3 text-xs text-white placeholder:text-slate-600 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-arabic"
                />
              </div>

              <p className="text-[10px] text-slate-500 mt-1.5 font-arabic">
                {filteredStreams.length} قناة
              </p>
            </div>
          )}
          <button
            onClick={onToggleChannelPanelCollapsed}
            className="rounded-lg p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {isChannelPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Channel List */}
        {!isChannelPanelCollapsed && (
          <div className="flex-1 min-h-0 p-2">
            <div className="h-full overflow-y-auto space-y-1">
              {filteredStreams.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-center text-slate-500">
                  <p className="text-xs font-arabic">لا توجد قنوات في هذا التصنيف</p>
                </div>
              ) : (
                filteredStreams.map((stream) => (
                  <ChannelListItem
                    key={stream.id}
                    stream={stream}
                    onPlay={onPlayStream}
                    isFavorite={isChannelFavorite(stream.id)}
                    onToggleFavorite={() => toggleChannelFavorite(stream.id)}
                    isActive={activeStreamId === stream.id}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
