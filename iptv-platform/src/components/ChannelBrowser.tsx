"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { AlertCircle, RefreshCw, Tv } from "lucide-react";
import { Navbar } from "./Navbar";
import { VideoPlayerArea } from "./VideoPlayerArea";
import { CategoriesSidebar } from "./CategoriesSidebar";
import { ChannelListPanel } from "./ChannelListPanel";
import { MobileControls } from "./MobileControls";
import { getCategoriesWithStreams } from "@/lib/api";
import type { ChannelCategory, ChannelStream } from "@/types/xtream";

const CACHE_KEY = "iptv-categories-cache";
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheData {
  categories: ChannelCategory[];
  timestamp: number;
}

export function ChannelBrowser() {
  const [categories, setCategories] = useState<ChannelCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChannelFavorites, setShowChannelFavorites] = useState(false);
  const [selectedStream, setSelectedStream] = useState<ChannelStream | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChannelListOpen, setIsChannelListOpen] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [isChannelPanelCollapsed, setIsChannelPanelCollapsed] = useState(false);

  const loadCategories = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const cacheData: CacheData = JSON.parse(cached);
          if (Date.now() - cacheData.timestamp < CACHE_DURATION && cacheData.categories.length > 0) {
            setCategories(cacheData.categories);
            if (cacheData.categories.length > 0) {
              setSelectedCategoryId((prev) => prev || cacheData.categories[0].id);
            }
            setIsLoading(false);
            return;
          }
        }
      }
      const newCategories = await getCategoriesWithStreams();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ categories: newCategories, timestamp: Date.now() }));
      setCategories(newCategories);
      if (newCategories.length > 0) {
        setSelectedCategoryId((prev) => prev || newCategories[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channels");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => { const next = !prev; if (next) setIsChannelListOpen(false); return next; });
  }, []);

  const toggleChannelList = useCallback(() => {
    setIsChannelListOpen((prev) => { const next = !prev; if (next) setIsSidebarOpen(false); return next; });
  }, []);

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return orderedCategories[0];
    return orderedCategories.find((c) => c.id === selectedCategoryId) ?? orderedCategories[0];
  }, [orderedCategories, selectedCategoryId]);

  const activeStreamId = selectedStream?.id ?? null;
  const totals = useMemo(() => ({
    totalStreams: categories.reduce((acc, c) => acc + c.streams.length, 0),
    totalCategories: categories.length,
  }), [categories]);

  const handlePlayStream = useCallback((stream: ChannelStream) => {
    setSelectedStream(stream);
    setIsPlayerOpen(true);
    setIsChannelListOpen(false);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setIsPlayerOpen(false);
    setSelectedStream(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-5" />
          <p className="text-slate-400 font-medium font-arabic">جاري تحميل القنوات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="text-center max-w-md mx-4">
          <div className="rounded-2xl bg-danger/10 p-6 mb-6 mx-auto w-fit border border-danger/20">
            <AlertCircle className="h-12 w-12 text-danger" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-3">فشل تحميل القنوات</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => loadCategories(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-light transition-all mx-auto glow-gold"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="text-center max-w-md mx-4">
          <div className="rounded-2xl bg-surface-light p-6 mb-6 mx-auto w-fit border border-white/5">
            <Tv className="h-12 w-12 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-3">لا توجد قنوات</h2>
          <p className="text-slate-400 mb-6">أضف قائمة M3U من لوحة تحكم الخادم</p>
          <button
            onClick={() => loadCategories(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-light transition-all mx-auto glow-gold"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-surface">
      <Navbar activePage="home" />

      <div className="flex flex-1 pt-14">
        <MobileControls
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          onToggleChannelList={toggleChannelList}
        />

        {(isSidebarOpen || isChannelListOpen) && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => { setIsSidebarOpen(false); setIsChannelListOpen(false); }}
          />
        )}

        <CategoriesSidebar
          categories={orderedCategories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={(id) => { setSelectedCategoryId(id); setSearchTerm(""); setIsSidebarOpen(false); }}
          isSidebarOpen={isSidebarOpen}
          isMenuCollapsed={isMenuCollapsed}
          onToggleMenuCollapsed={() => setIsMenuCollapsed(!isMenuCollapsed)}
          totals={totals}
        />

        <ChannelListPanel
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showChannelFavorites={showChannelFavorites}
          onToggleChannelFavorites={() => setShowChannelFavorites(!showChannelFavorites)}
          isChannelPanelCollapsed={isChannelPanelCollapsed}
          onToggleChannelPanelCollapsed={() => setIsChannelPanelCollapsed(!isChannelPanelCollapsed)}
          onPlayStream={handlePlayStream}
          activeStreamId={activeStreamId}
        />

        <VideoPlayerArea
          selectedStream={selectedStream}
          isPlayerOpen={isPlayerOpen}
          onClosePlayer={handleClosePlayer}
        />
      </div>
    </div>
  );
}
