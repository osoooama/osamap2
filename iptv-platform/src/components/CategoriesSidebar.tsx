"use client";

import { Tv, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { CascaderMenu } from "./CascaderMenu";
import type { ChannelCategory } from "@/types/xtream";

interface CategoriesSidebarProps {
  categories: ChannelCategory[];
  selectedCategoryId: string;
  onCategorySelect: (categoryId: string) => void;
  isSidebarOpen: boolean;
  isMenuCollapsed: boolean;
  onToggleMenuCollapsed: () => void;
  totals: { totalStreams: number; totalCategories: number };
}

export const CategoriesSidebar = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  isSidebarOpen,
  isMenuCollapsed,
  onToggleMenuCollapsed,
  totals,
}: CategoriesSidebarProps) => {
  return (
    <aside
      className={clsx(
        "shrink-0 fixed lg:static inset-y-0 left-0 z-40 bg-surface-light/95 backdrop-blur-xl border-r border-primary/5 transition-all duration-300 ease-in-out shadow-2xl shadow-black/50 lg:shadow-none pt-14 lg:pt-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isMenuCollapsed ? "w-14" : "w-[80vw] max-w-xs sm:w-72 lg:w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/5">
          {!isMenuCollapsed && (
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 border border-primary/10">
                <Tv className="h-3 w-3 text-primary" />
                <span className="font-semibold text-white">{totals.totalStreams}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 border border-white/5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="font-semibold text-white">{totals.totalCategories}</span>
              </div>
            </div>
          )}
          <button
            onClick={onToggleMenuCollapsed}
            className="rounded-lg p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {isMenuCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Menu Content */}
        {!isMenuCollapsed && (
          <div className="flex-1 min-h-0 p-3">
            <CascaderMenu
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={onCategorySelect}
            />
          </div>
        )}

        {isMenuCollapsed && (
          <div className="flex-1 flex flex-col items-center py-6 space-y-3">
            <div className="rounded-lg p-2.5 bg-primary/10 text-primary border border-primary/10">
              <Tv className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
