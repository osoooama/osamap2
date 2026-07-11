'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import {
  X, Maximize2, Minimize2, Subtitles, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

interface Quality {
  label: string;
  url: string;
}

interface Episode {
  number: number;
  title: string;
  url: string;
}

interface VideoPlayerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl: string;
  subtitleUrl?: string;
  title: string;
  qualities?: Quality[];
  episodes?: Episode[];
  poster?: string;
}

export default function VideoPlayerOverlay({
  isOpen, onClose, embedUrl, subtitleUrl, title,
  qualities = [], episodes = [], poster = '',
}: VideoPlayerOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(0);
  const [currentEp, setCurrentEp] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  const isYoutube = (url: string) => /youtube\.com\/embed|youtube\.com\/watch|youtu\.be/.test(url);
  const activeUrl = episodes.length > 0 ? episodes[currentEp]?.url || embedUrl : qualities[currentQuality]?.url || embedUrl;
  const isYt = isYoutube(activeUrl);

  useEffect(() => {
    if (!isOpen || !videoRef.current || !activeUrl || isYt) return;
    setError('');
    setLoaded(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (activeUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.loadSource(activeUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoaded(true);
          videoRef.current?.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError('فشل تحميل الفيديو. حاول مرة أخرى.');
            hls.destroy();
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = activeUrl;
        videoRef.current.addEventListener('loadedmetadata', () => {
          setLoaded(true);
          videoRef.current?.play().catch(() => {});
        });
      } else {
        setError('المتصفح لا يدعم تشغيل هذا النوع من الفيديو');
      }
    } else {
      videoRef.current.src = activeUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        setLoaded(true);
        videoRef.current?.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [isOpen, activeUrl, isYt]);

  useEffect(() => {
    const show = () => { setShowControls(true); };
    const hide = () => {
      controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    };
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', show);
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    return () => {
      el.removeEventListener('mousemove', show);
      el.removeEventListener('mouseenter', show);
      el.removeEventListener('mouseleave', hide);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
    setPlaying(!videoRef.current.paused);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const switchQuality = useCallback((idx: number) => {
    setCurrentQuality(idx);
    setShowQuality(false);
  }, []);

  const prevEp = useCallback(() => {
    if (currentEp > 0) setCurrentEp(e => e - 1);
  }, [currentEp]);

  const nextEp = useCallback(() => {
    if (currentEp < episodes.length - 1) setCurrentEp(e => e + 1);
  }, [currentEp]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full h-full"
            onClick={e => e.stopPropagation()}
          >
            <div ref={containerRef} className="relative w-full h-full bg-black group">
              {isYt ? (
                <iframe
                  src={activeUrl.replace('/embed/', '/embed/') + '?autoplay=1&rel=0'}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                  poster={poster}
                  playsInline
                  controls={false}
                />
              )}

              {!isYt && !loaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}

              {!isYt && error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                  <div className="text-center text-white">
                    <p className="text-xl mb-2">⚠️</p>
                    <p>{error}</p>
                    <button onClick={() => { setError(''); setLoaded(true); }} className="mt-4 px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">إعادة المحاولة</button>
                  </div>
                </div>
              )}

              <div className={`absolute inset-0 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-10`}>
                {episodes.length > 1 && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                    <button onClick={prevEp} disabled={currentEp === 0} className="flex items-center gap-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition disabled:opacity-30 text-white text-sm">
                      <ChevronRight className="w-4 h-4" /> السابق
                    </button>
                    <span className="text-white/80 text-sm">{episodes[currentEp]?.title || `الحلقة ${currentEp + 1}`}</span>
                    <button onClick={nextEp} disabled={currentEp >= episodes.length - 1} className="flex items-center gap-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition disabled:opacity-30 text-white text-sm">
                      التالي <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                  <button onClick={() => navigator.clipboard.writeText(activeUrl)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-white/20 transition" title="نسخ الرابط">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>

                  <button onClick={toggleFullscreen} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-white/20 transition" title="ملء الشاشة">
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>

                  {subtitleUrl && (
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-yellow-400 hover:bg-white/20 transition" title="الترجمة">
                      <Subtitles className="w-5 h-5" />
                    </button>
                  )}

                  {(qualities.length > 1 || episodes.length > 0) && (
                    <div className="relative">
                      <button onClick={() => setShowQuality(q => !q)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-white/20 transition" title="الإعدادات">
                        <Settings className="w-5 h-5" />
                      </button>
                      {showQuality && (
                        <div className="absolute right-0 top-12 w-48 rounded-xl bg-black/90 border border-white/10 py-2 shadow-2xl backdrop-blur-xl z-30 max-h-80 overflow-y-auto">
                          {qualities.length > 1 && (
                            <div className="px-3 py-2">
                              <p className="text-xs text-white/50 mb-1">الجودة</p>
                              {qualities.map((q, i) => (
                                <button key={q.label} onClick={() => switchQuality(i)} className={`w-full text-right px-3 py-2 rounded-lg text-sm transition ${i === currentQuality ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10'}`}>
                                  {q.label}
                                </button>
                              ))}
                            </div>
                          )}
                          {episodes.length > 0 && (
                            <div className="border-t border-white/10 px-3 pt-2">
                              <p className="text-xs text-white/50 mb-1">الحلقات</p>
                              {episodes.map((ep, i) => (
                                <button key={ep.number} onClick={() => setCurrentEp(i)} className={`w-full text-right px-3 py-2 rounded-lg text-sm transition ${i === currentEp ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10'}`}>
                                  {ep.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/80 transition" title="إغلاق">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white">
                      {playing ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      )}
                    </button>
                    <h2 className="text-white font-bold text-lg drop-shadow-lg truncate">{title}</h2>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
