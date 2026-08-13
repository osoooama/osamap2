'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tv, Search, Play, Radio, X, RefreshCw, Wifi, Globe, Baby, Newspaper, Swords, Music, BookOpen, Clapperboard, Circle, AlertTriangle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://osamap2.onrender.com';

interface Channel {
  channel_id: string;
  name: string;
  stream_url: string;
  category: string;
  logo_url?: string;
  stream_type: 'live' | 'movie' | 'series';
  source: string;
  is_alive: boolean;
  last_checked: string;
}

interface ChannelHealth {
  total: number;
  alive: number;
  dead: number;
  healthPercent: number;
  lastChecked: string | null;
}

const CATEGORY_ICONS: Record<string, typeof Tv> = {
  Sports: Tv,
  Kids: Baby,
  News: Newspaper,
  Arabic: Globe,
  Turkish: Globe,
  UFC: Swords,
  Music: Music,
  Documentary: BookOpen,
  Entertainment: Clapperboard,
  General: Tv,
};

const CATEGORY_COLORS: Record<string, string> = {
  Sports: 'from-green-500 to-emerald-600',
  Kids: 'from-pink-500 to-rose-600',
  News: 'from-blue-500 to-indigo-600',
  Arabic: 'from-amber-500 to-orange-600',
  Turkish: 'from-red-500 to-rose-600',
  UFC: 'from-red-600 to-red-800',
  Music: 'from-purple-500 to-violet-600',
  Documentary: 'from-teal-500 to-cyan-600',
  Entertainment: 'from-fuchsia-500 to-pink-600',
  General: 'from-zinc-500 to-zinc-700',
};

export default function LivePage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelCount, setChannelCount] = useState(0);
  const [health, setHealth] = useState<ChannelHealth | null>(null);
  const [playerError, setPlayerError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/channels?limit=500`);
      const data = await resp.json();
      setChannels(data.channels || []);
      setChannelCount(data.count || 0);
    } catch {
      setChannels([]);
    }
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/channels/categories`);
      const data = await resp.json();
      setCategories(data.categories || []);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const resp = await fetch(`${API_URL}/api/channels/health`);
      const data = await resp.json();
      setHealth(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchChannels();
    fetchCategories();
    fetchHealth();
  }, [fetchChannels, fetchCategories, fetchHealth]);

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const initPlayer = useCallback(async (channel: Channel) => {
    setPlayerError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const url = channel.stream_url;

    if (url.includes('.m3u8')) {
      try {
        const Hls = (await import('hls.js')).default;
        if (Hls.isSupported() && videoRef.current) {
          const hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            enableWorker: true,
          });
          hlsRef.current = hls as unknown as { destroy: () => void };
          hls.loadSource(url);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current?.play().catch(() => {});
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) {
              setPlayerError(true);
            }
          });
        } else if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.play().catch(() => {});
        }
      } catch {
        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.play().catch(() => {});
        }
      }
    } else if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleSelectChannel = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    setTimeout(() => initPlayer(channel), 100);
  }, [initPlayer]);

  const handleClosePlayer = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    setSelectedChannel(null);
    setPlayerError(false);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch(`${API_URL}/api/channels/refresh`, { method: 'POST' });
      await fetchChannels();
      await fetchCategories();
      await fetchHealth();
    } catch {
      // silent
    }
    setRefreshing(false);
  };

  const filtered = channels.filter(ch => {
    const matchesCategory = selectedCategory === 'all' || ch.category === selectedCategory;
    const matchesSearch = !searchQuery || ch.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = channels.filter(ch => ch.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">بث مباشر</h1>
              <p className="text-zinc-500 text-[10px]">
                {channelCount > 0 ? `${channelCount} قناة` : 'قنوات IPTV'}
                {health && (
                  <span className="mr-2">
                    <Circle className={`inline w-1.5 h-1.5 fill-current ${health.healthPercent > 70 ? 'text-green-500' : health.healthPercent > 40 ? 'text-yellow-500' : 'text-red-500'}`} />
                    {' '}{health.healthPercent}% تعمل
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-zinc-400 text-xs font-medium hover:bg-white/10 transition disabled:opacity-50"
              aria-label="تحديث القنوات"
            >
              {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              تحديث
            </button>
            {selectedChannel && (
              <button
                onClick={handleClosePlayer}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
                aria-label="إغلاق البث"
              >
                <X className="w-3 h-3" />
                إغلاق
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Player */}
        {selectedChannel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
              {playerError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mb-3" />
                  <p className="text-white font-medium">القناة غير متاحة حالياً</p>
                  <p className="text-zinc-500 text-sm mt-1">قد يكون الرابط معطلاً أو غير مدعوم</p>
                  <button
                    onClick={handleClosePlayer}
                    className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition"
                  >
                    إغلاق المشغل
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  key={selectedChannel.channel_id}
                  className="w-full h-full"
                  controls
                  autoPlay
                  playsInline
                />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-sm">{selectedChannel.name}</h2>
                <p className="text-zinc-500 text-[10px]">{selectedChannel.category} • {selectedChannel.source}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className={`w-2 h-2 fill-current ${selectedChannel.is_alive ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-[10px] font-medium ${selectedChannel.is_alive ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedChannel.is_alive ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="بحث في القنوات..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition"
            aria-label="بحث في القنوات"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
            }`}
          >
            <Tv className="w-3 h-3" />
            الكل ({channels.length})
          </button>
          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat] || Tv;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3 h-3" />
                {cat} ({categoryCounts[cat] || 0})
              </button>
            );
          })}
        </div>

        {/* Channels grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-2 border-red-600/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-red-600 rounded-full animate-spin" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Tv className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg font-medium">لا توجد قنوات</p>
            <p className="text-zinc-700 text-sm mb-4">
              {searchQuery ? 'لم يتم العثور على نتائج' : 'اضغط "تحديث" لجلب القنوات'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                تحديث القنوات
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((ch, i) => (
              <motion.button
                key={ch.channel_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                onClick={() => handleSelectChannel(ch)}
                className={`relative group bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-right hover:bg-zinc-900/80 transition-all ${
                  selectedChannel?.channel_id === ch.channel_id ? 'ring-2 ring-red-500/50' : ''
                }`}
                aria-label={`تشغيل ${ch.name}`}
              >
                {/* Health indicator */}
                <div className="absolute top-2 left-2">
                  <Circle className={`w-2 h-2 fill-current ${ch.is_alive ? 'text-green-500' : 'text-red-500'}`} />
                </div>

                {ch.logo_url ? (
                  <img src={ch.logo_url} alt="" className="w-full aspect-square object-contain rounded-lg mb-2 bg-zinc-800/50" loading="lazy" />
                ) : (
                  <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[ch.category] || CATEGORY_COLORS.General} flex items-center justify-center mb-2 opacity-60`}>
                    <Tv className="w-8 h-8 text-white/60" />
                  </div>
                )}
                <p className="text-white text-xs font-medium truncate">{ch.name}</p>
                <p className="text-zinc-600 text-[10px] truncate">{ch.category}</p>
                <div className="absolute inset-0 rounded-xl bg-red-500/0 group-hover:bg-red-500/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-10 h-10 rounded-full bg-red-600/80 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
