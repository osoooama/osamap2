'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import {
  X, Maximize2, Minimize2, Subtitles, Settings,
  ChevronLeft, ChevronRight, Play, Pause, RefreshCw,
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
  onError?: () => void;
  providerName?: string;
}

export default function VideoPlayerOverlay({
  isOpen, onClose, embedUrl, subtitleUrl, title,
  qualities = [], episodes = [], poster = '',
  onError, providerName,
}: VideoPlayerOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLTrackElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(0);
  const [currentEp, setCurrentEp] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isEmbedError, setIsEmbedError] = useState(false);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  const hasStreams = qualities.length > 0 || episodes.length > 0 || embedUrl;
  const activeUrl = episodes.length > 0 ? episodes[currentEp]?.url || embedUrl : qualities[currentQuality]?.url || embedUrl;
  const isEmbedPage = activeUrl.includes('xpass') || activeUrl.includes('vid3rb') || activeUrl.includes('embed') || activeUrl.includes('vidsrc') || activeUrl.includes('vidlink') || activeUrl.includes('multiembed');

  useEffect(() => {
    if (!isOpen || !videoRef.current || !activeUrl || isEmbedPage) return;
    setError('');
    setLoaded(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (activeUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(activeUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoaded(true);
          videoRef.current?.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError('فشل تحميل الفيديو');
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
    } else if (activeUrl) {
      videoRef.current.src = activeUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        setLoaded(true);
        videoRef.current?.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [isOpen, activeUrl]);

  useEffect(() => {
    if (!isOpen || !isEmbedPage) return;
    setIsEmbedError(false);
  }, [activeUrl]);

  const handleEmbedError = useCallback(() => {
    setIsEmbedError(true);
    if (onError) onError();
  }, [onError]);

  useEffect(() => {
    const show = () => {
      setShowControls(true);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
    const hide = () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
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

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => { setCurrentTime(v.currentTime); setDuration(v.duration || 0); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, [loaded]);

  useEffect(() => {
    if (!videoRef.current || !trackRef.current) return;
    if (subtitlesOn && subtitleUrl) {
      trackRef.current.src = subtitleUrl;
      trackRef.current.track.mode = 'showing';
    } else if (trackRef.current) {
      trackRef.current.track.mode = 'hidden';
    }
  }, [subtitlesOn, subtitleUrl, loaded]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
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
    setShowSettings(false);
  }, []);

  const prevEp = useCallback(() => {
    if (currentEp > 0) setCurrentEp(e => e - 1);
  }, [currentEp]);

  const nextEp = useCallback(() => {
    if (currentEp < episodes.length - 1) setCurrentEp(e => e + 1);
  }, [currentEp]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * duration;
  }, [duration]);

  const changeVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

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
              {!hasStreams ? (
                <div className="flex items-center justify-center h-full bg-zinc-900">
                  <div className="text-center text-zinc-400">
                    <p className="text-6xl mb-6">🎬</p>
                    <p className="text-xl font-bold mb-2">لا توجد روابط متاحة حالياً</p>
                    <p className="text-sm text-zinc-600 mb-6">سيتم إضافة روابط البث قريباً</p>
                    <button
                      onClick={onClose}
                      className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition text-white font-medium"
                    >
                      العودة
                    </button>
                  </div>
                </div>
              ) : isEmbedPage ? (
                <div className="relative w-full h-full">
                  {isEmbedError ? (
                    <div className="flex items-center justify-center h-full bg-zinc-900">
                      <div className="text-center text-zinc-400">
                        <p className="text-5xl mb-4">⚠️</p>
                        <p className="text-lg font-bold mb-2">تعذر تحميل المشغل</p>
                        <p className="text-sm text-zinc-600 mb-6">حاول مع مزود آخر</p>
                        {onError && (
                          <button
                            onClick={() => { setIsEmbedError(false); onError(); }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition text-white font-medium"
                          >
                            <RefreshCw className="w-4 h-4" />
                            التبديل للمزود التالي
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={activeUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; encrypted-media; fullscreen"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      onError={handleEmbedError}
                    />
                  )}

                  {/* Minimal overlay for embed */}
                  <div className={`absolute top-0 left-0 right-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                      <div className="flex items-center gap-3">
                        {providerName && (
                          <span className="text-xs text-zinc-500 bg-black/40 px-2 py-1 rounded">
                            {providerName}
                          </span>
                        )}
                        <h2 className="text-white font-bold text-sm truncate max-w-md">{title}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={toggleFullscreen} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-white/20 transition">
                          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/80 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={togglePlay}
                    poster={poster}
                    playsInline
                    controls={false}
                  >
                    {subtitleUrl && <track ref={trackRef} kind="subtitles" srcLang="ar" label="العربية" />}
                  </video>

                  {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                      <div className="relative">
                        <div className="w-14 h-14 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                        <div className="w-14 h-14 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin absolute inset-0 opacity-40" style={{ animationDirection: 'reverse' }} />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                      <div className="text-center text-white">
                        <p className="text-4xl mb-4">⚠️</p>
                        <p className="text-lg font-bold mb-1">{error}</p>
                        <p className="text-sm text-zinc-400 mb-6">قد يكون المزود غير متاح</p>
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => { setError(''); setLoaded(true); if (onError) onError(); }}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl transition font-medium inline-flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            التبديل للمزود التالي
                          </button>
                          <button onClick={onClose} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition">
                            إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`absolute inset-0 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-10`}>
                    {episodes.length > 1 && (
                      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                        <button onClick={prevEp} disabled={currentEp === 0} className="flex items-center gap-1 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition disabled:opacity-30 text-white text-sm">
                          <ChevronRight className="w-4 h-4" /> السابق
                        </button>
                        <span className="text-white/80 text-sm font-medium">{episodes[currentEp]?.title || `الحلقة ${currentEp + 1}`}</span>
                        <button onClick={nextEp} disabled={currentEp >= episodes.length - 1} className="flex items-center gap-1 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition disabled:opacity-30 text-white text-sm">
                          التالي <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                      {subtitleUrl && (
                        <button onClick={() => setSubtitlesOn(s => !s)} className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/60 hover:bg-white/20 transition ${subtitlesOn ? 'text-yellow-400' : 'text-white'}`} title="الترجمة">
                          <Subtitles className="w-5 h-5" />
                        </button>
                      )}

                      {(qualities.length > 1 || episodes.length > 0) && (
                        <div className="relative">
                          <button onClick={() => setShowSettings(q => !q)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-white/20 transition" title="الإعدادات">
                            <Settings className="w-5 h-5" />
                          </button>
                          {showSettings && (
                            <div className="absolute right-0 top-12 w-48 rounded-2xl bg-black/90 border border-white/10 py-2 shadow-2xl backdrop-blur-xl z-30 max-h-80 overflow-y-auto">
                              {qualities.length > 1 && (
                                <div className="px-3 py-2">
                                  <p className="text-xs text-white/50 mb-1 px-2">الجودة</p>
                                  {qualities.map((q, i) => (
                                    <button key={q.label} onClick={() => switchQuality(i)} className={`w-full text-right px-4 py-2.5 rounded-lg text-sm transition ${i === currentQuality ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10'}`}>
                                      {q.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {episodes.length > 0 && (
                                <div className="border-t border-white/10 px-3 pt-2">
                                  <p className="text-xs text-white/50 mb-1 px-2">الحلقات</p>
                                  {episodes.map((ep, i) => (
                                    <button key={ep.number} onClick={() => setCurrentEp(i)} className={`w-full text-right px-4 py-2.5 rounded-lg text-sm transition ${i === currentEp ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10'}`}>
                                      {ep.title}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <button onClick={toggleFullscreen} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-white/20 transition" title="ملء الشاشة">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                      </button>

                      <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500/80 transition" title="إغلاق">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-4 z-20">
                      <div className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer mb-3 group/progress" onClick={seek}>
                        <div className="h-full bg-red-600 rounded-full relative transition-all duration-200" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={togglePlay} className="text-white hover:text-white/80 transition">
                            {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                          </button>
                          <span className="text-white/60 text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={changeVolume} className="w-20 accent-red-600" />
                          <h2 className="text-white font-bold text-sm drop-shadow-lg truncate max-w-48">{title}</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
