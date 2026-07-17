'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tv, Search, Play, Radio, Film, List, X, Volume2, VolumeX, Maximize } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://osamap2.onrender.com';

interface Channel {
  channel_id: string;
  name: string;
  stream_url: string;
  category: string;
  logo_url?: string;
  stream_type: 'live' | 'movie' | 'series';
}

export default function LivePage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [streamType, setStreamType] = useState<'live' | 'movie' | 'series'>('live');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchChannels();
    fetchCategories();
  }, [streamType]);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/channels?type=${streamType}`);
      const data = await resp.json();
      setChannels(data.channels || []);
    } catch {
      setChannels([]);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/channels/categories`);
      const data = await resp.json();
      setCategories(data.categories || []);
    } catch {
      setCategories([]);
    }
  };

  const filtered = channels.filter(ch => {
    const matchesCategory = selectedCategory === 'all' || ch.category === selectedCategory;
    const matchesSearch = !searchQuery || ch.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const typeButtons = [
    { key: 'live', label: 'بث مباشر', icon: Radio, color: 'red' },
    { key: 'movie', label: 'أفلام', icon: Film, color: 'blue' },
    { key: 'series', label: 'مسلسلات', icon: Tv, color: 'purple' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">بث مباشر</h1>
              <p className="text-zinc-500 text-[10px]">قنوات IPTV — Xtream Codes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedChannel && (
              <button
                onClick={() => setSelectedChannel(null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium hover:bg-red-500/20 transition"
              >
                <X className="w-3 h-3" />
                إغلاق البث
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Player */}
        {selectedChannel && (
          <div className="mb-6">
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                ref={iframeRef}
                key={selectedChannel.channel_id}
                src={selectedChannel.stream_url}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen"
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-sm">{selectedChannel.name}</h2>
                <p className="text-zinc-500 text-[10px]">{selectedChannel.category}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stream type tabs */}
        <div className="flex gap-2 mb-6">
          {typeButtons.map(t => (
            <button
              key={t.key}
              onClick={() => setStreamType(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                streamType === t.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="بحث في القنوات..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition"
          />
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              الكل ({channels.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Channels grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-2 border-emerald-600/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Tv className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg font-medium">لا توجد قنوات</p>
            <p className="text-zinc-700 text-sm">لم يتم العثور على قنوات — تأكد من إعداد Xtream API</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((ch, i) => (
              <motion.button
                key={ch.channel_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedChannel(ch)}
                className={`relative group bg-zinc-900/50 border border-white/5 rounded-xl p-3 text-right hover:bg-zinc-900/80 transition-all ${
                  selectedChannel?.channel_id === ch.channel_id ? 'ring-2 ring-emerald-500/50' : ''
                }`}
              >
                {ch.logo_url ? (
                  <img src={ch.logo_url} alt="" className="w-full aspect-square object-contain rounded-lg mb-2 bg-zinc-800/50" />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-zinc-800/50 flex items-center justify-center mb-2">
                    <Tv className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
                <p className="text-white text-xs font-medium truncate">{ch.name}</p>
                <p className="text-zinc-600 text-[10px] truncate">{ch.category}</p>
                <div className="absolute inset-0 rounded-xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Play className="w-8 h-8 text-white/80" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
