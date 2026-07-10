'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import {
  X,
  Maximize2,
  Minimize2,
  Subtitles,
  Settings,
  Play,
  Pause,
} from 'lucide-react';

interface VideoPlayerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl: string;
  subtitleUrl?: string;
  title: string;
  qualityOptions?: string[];
}

export default function VideoPlayerOverlay({
  isOpen,
  onClose,
  embedUrl,
  subtitleUrl,
  title,
  qualityOptions = ['4K', '1080p', '720p'],
}: VideoPlayerOverlayProps) {
  const [playing, setPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [subtitlesOn, setSubtitlesOn] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(qualityOptions[1]);
  const playerRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

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

  const handleQualitySelect = useCallback((q: string) => {
    setCurrentQuality(q);
    setShowQuality(false);
  }, []);

  const isM3U8 = embedUrl.includes('.m3u8');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={containerRef}
              className="relative aspect-video bg-black rounded-xl overflow-hidden group"
            >
              <ReactPlayer
                ref={playerRef}
                src={embedUrl}
                width="100%"
                height="100%"
                playing={playing}
                controls
                config={{
                  html: {
                    attributes: {
                      controlsList: 'nodownload',
                      crossOrigin: 'anonymous' as any,
                    },
                  },
                  ...(isM3U8 ? { hls: {} } : {}),
                }}
                style={{ position: 'absolute', top: 0, left: 0 }}
              />

              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={toggleFullscreen}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                  title="ملء الشاشة"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>

                {subtitleUrl && (
                  <button
                    onClick={() => setSubtitlesOn((s) => !s)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/50 transition hover:bg-black/70 ${
                      subtitlesOn ? 'text-yellow-400' : 'text-white'
                    }`}
                    title="الترجمة"
                  >
                    <Subtitles className="h-4 w-4" />
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowQuality((q) => !q)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                    title="الجودة"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  {showQuality && (
                    <div className="absolute right-0 top-10 w-32 rounded-lg bg-black/90 border border-zinc-700 py-1 shadow-xl">
                      {qualityOptions.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleQualitySelect(q)}
                          className={`w-full px-3 py-1.5 text-sm text-left transition hover:bg-white/10 ${
                            q === currentQuality ? 'text-netflix font-semibold' : 'text-zinc-300'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-600 transition"
                  title="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 z-10">
                <h2 className="text-lg font-bold text-white drop-shadow-lg">{title}</h2>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
