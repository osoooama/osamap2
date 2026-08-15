"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import { Heart, HeartOff, Star, StarOff } from "lucide-react";
import type { ChannelCategory } from "@/types/xtream";
import { useFavorites } from "@/hooks/useFavorites";

interface CascaderMenuProps {
  categories: ChannelCategory[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
}

export function CascaderMenu({
  categories,
  selectedCategoryId,
  onCategorySelect,
}: CascaderMenuProps) {
  const [showFavorites, setShowFavorites] = useState(false);
  const { isCategoryFavorite, toggleCategoryFavorite, getFavoriteCategories } = useFavorites();

  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const favoriteCategories = useMemo(
    () => getFavoriteCategories(orderedCategories),
    [orderedCategories, getFavoriteCategories]
  );

  const displayCategories = useMemo(() => {
    if (showFavorites) return favoriteCategories;
    const favs = favoriteCategories;
    const others = orderedCategories.filter((cat) => !favs.some((f) => f.id === cat.id));
    return [...favs, ...others];
  }, [showFavorites, favoriteCategories, orderedCategories]);

  return (
    <div className="flex h-full flex-col min-h-0">
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-arabic">التصنيفات</h2>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={clsx(
              "rounded-lg p-1.5 transition-all",
              showFavorites
                ? "bg-primary/20 text-primary border border-primary/20"
                : "text-slate-500 hover:text-white hover:bg-white/5"
            )}
          >
            {showFavorites ? <Star className="h-3.5 w-3.5" /> : <StarOff className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {displayCategories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-center text-slate-500">
            <p className="text-xs font-arabic">
              {showFavorites ? "لا توجد تصنيفات مفضلة" : "لا توجد تصنيفات"}
            </p>
          </div>
        ) : (
          displayCategories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            const isFavorite = isCategoryFavorite(category.id);

            return (
              <div key={category.id} className="flex items-center gap-1 min-w-0">
                <button
                  onClick={() => onCategorySelect(category.id)}
                  className={clsx(
                    "flex-1 flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-all duration-200 min-w-0 overflow-hidden",
                    isSelected
                      ? "bg-primary/15 text-primary border border-primary/20 shadow-sm shadow-primary/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <span className="truncate" title={category.name}>{category.name}</span>
                  <span className={clsx(
                    "text-[10px] ml-2 shrink-0 rounded-full px-1.5 py-0.5",
                    isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-500"
                  )}>
                    {category.streams.length}
                  </span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); toggleCategoryFavorite(category.id); }}
                  className={clsx(
                    "rounded-lg p-1.5 transition-all shrink-0",
                    isFavorite ? "text-primary hover:text-primary-light" : "text-slate-600 hover:text-slate-400"
                  )}
                >
                  {isFavorite ? <Heart className="h-3 w-3" /> : <HeartOff className="h-3 w-3" />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
