'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Play, Clock, Tv, Zap, ChevronLeft, ChevronRight, Radio } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://osamap2.onrender.com';

interface Match {
  match_id: string;
  home_team: string;
  away_team: string;
  league: string;
  match_time: string;
  match_status: 'upcoming' | 'live' | 'finished';
  home_score?: number;
  away_score?: number;
  stream_url?: string;
  match_date: string;
}

export default function SportsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all');

  useEffect(() => {
    fetchMatches();
  }, [selectedDate]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/matches?date=${selectedDate}`);
      const data = await resp.json();
      setMatches(data.matches || []);
    } catch {
      setMatches([]);
    }
    setLoading(false);
  };

  const filtered = matches.filter(m => filter === 'all' || m.match_status === filter);
  const liveCount = matches.filter(m => m.match_status === 'live').length;
  const upcomingCount = matches.filter(m => m.match_status === 'upcoming').length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">المباريات</h1>
              <p className="text-zinc-500 text-[10px]">بث مباشر — filgoal.com</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {liveCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                <span className="text-red-400 text-xs font-medium">{liveCount} مباشر</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Date selector */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => changeDate(-1)} className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">{formatDate(selectedDate)}</p>
          </div>
          <button onClick={() => changeDate(1)} className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'الكل', count: matches.length },
            { key: 'live', label: 'مباشر', count: liveCount },
            { key: 'upcoming', label: 'قادم', count: upcomingCount },
            { key: 'finished', label: 'انتهى', count: matches.filter(m => m.match_status === 'finished').length },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                filter === f.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f.label}
              {f.count > 0 && <span className="mr-1 text-[10px] opacity-60">({f.count})</span>}
            </button>
          ))}
        </div>

        {/* Matches grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-2 border-emerald-600/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 rounded-full animate-spin" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg font-medium">لا توجد مباريات</p>
            <p className="text-zinc-700 text-sm">لم يتم العثور على مباريات لهذا التاريخ</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((match, i) => (
              <motion.div
                key={match.match_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 hover:bg-zinc-900/80 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-zinc-600 font-medium">{match.league}</span>
                      {match.match_status === 'live' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-medium">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                          مباشر
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-semibold text-sm flex-1 text-right">{match.home_team}</span>
                      {match.match_status === 'finished' || match.match_status === 'live' ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/80 rounded-lg">
                          <span className="text-white font-bold text-lg">{match.home_score ?? '-'}</span>
                          <span className="text-zinc-600 text-xs">-</span>
                          <span className="text-white font-bold text-lg">{match.away_score ?? '-'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1 bg-zinc-800/80 rounded-lg">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span className="text-zinc-400 text-xs">{match.match_time}</span>
                        </div>
                      )}
                      <span className="text-white font-semibold text-sm flex-1 text-left">{match.away_team}</span>
                    </div>
                  </div>
                  {match.stream_url && (
                    <a
                      href={match.stream_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all"
                    >
                      <Play className="w-3 h-3" />
                      شاهد
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
