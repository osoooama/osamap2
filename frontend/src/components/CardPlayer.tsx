'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProviders } from '@/lib/providers';
import { getMovieDetails } from '@/lib/api';
import { X, ExternalLink, RefreshCw, Monitor } from 'lucide-react';

interface CardPlayerProps {
  tmdbId: string;
  mediaType?: string;
  title: string;
  onClose: () => void;
}

export default function CardPlayer({ tmdbId, mediaType = 'movie', title, onClose }: CardPlayerProps) {
  const [providers] = useState(() => getProviders(tmdbId, mediaType));
  const [currentProvider, setCurrentProvider] = useState(0);
  const [qualities, setQualities] = useState<{ label: string; url: string }[]>([]);
  const [linkError, setLinkError] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(true);

  useEffect(() => {
    getMovieDetails(tmdbId)
      .then((data) => {
        const links = data.links || [];
        const qs = links
          .filter((l: any) => l.embed_url && l.embed_url.startsWith('http'))
          .map((l: any) => ({ label: l.quality || '720p', url: l.embed_url }))
          .filter((v: any, i: number, a: any[]) => a.findIndex((x: any) => x.url === v.url) === i);
        setQualities(qs);
      })
      .catch(() => {})
      .finally(() => setLoadingLinks(false));
  }, [tmdbId]);

  const activeUrl = currentProvider < providers.length
    ? providers[currentProvider].url
    : qualities[0]?.url || '';

  const embedDomains = ['embed', 'vidsrc', 'vidlink', 'multiembed', 'xpass', 'screenscape', 'vidplays', 'modocine', 'vidcore', 'apiplayer', '2embed', 'vidfast', 'videasy', 'smashystream', 'frembed', 'vidking', 'vidnest', 'vidrift', 'vidlove'];
  const isEmbed = embedDomains.some(d => activeUrl.includes(d));

  const handleProviderError = () => {
    if (currentProvider < providers.length - 1) {
      setCurrentProvider((p) => p + 1);
      setLinkError(false);
    } else {
      setLinkError(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full overflow-hidden rounded-xl bg-black"
    >
      {/* Player Area */}
      <div className="relative w-full aspect-video bg-black">
        {linkError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <div className="text-center text-zinc-400">
              <p className="text-lg font-bold mb-1">لا توجد روابط شغالة</p>
              <p className="text-xs text-zinc-600 mb-3">جرب مزود آخر أو افتح المشغل الكامل</p>
              <div className="flex gap-2 justify-center">
                <button onClick={handleProviderError} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs transition inline-flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" /> تبديل المزود
                </button>
                <a
                  href={`/player?tmdb_id=${tmdbId}&type=${mediaType}`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3" /> المشغل الكامل
                </a>
              </div>
            </div>
          </div>
        ) : activeUrl ? (
          isEmbed ? (
            <iframe
              src={activeUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen"
              onError={handleProviderError}
            />
          ) : (
            <video
              src={activeUrl}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            />
          )
        ) : loadingLinks ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <div className="w-8 h-8 border-3 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <div className="text-center text-zinc-500">
              <Monitor className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">لا توجد روابط متاحة</p>
              <a
                href={`/player?tmdb_id=${tmdbId}&type=${mediaType}`}
                className="mt-2 inline-block px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition"
              >
                المشغل الكامل
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Server Selection */}
      {providers.length > 0 && (
        <div className="px-3 py-2 bg-zinc-900/80">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] text-zinc-500">المزود:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {providers.slice(0, 6).map((p, i) => (
              <button
                key={p.name}
                onClick={() => { setCurrentProvider(i); setLinkError(false); }}
                className={`px-2 py-1 rounded text-[10px] font-medium transition ${
                  i === currentProvider
                    ? 'bg-red-600 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quality + Actions */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          {qualities.length > 0 && (
            <span className="text-[10px] text-zinc-500">
              {qualities.map((q) => q.label).join(' | ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleProviderError}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
            title="تبديل المزود"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <a
            href={`/player?tmdb_id=${tmdbId}&type=${mediaType}`}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
            title="المشغل الكامل"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
            title="إغلاق"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
