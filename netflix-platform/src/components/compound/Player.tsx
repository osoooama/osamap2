"use client";

import React, { useState, useContext, createContext, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Play, X, Volume2, VolumeX } from "lucide-react";

interface PlayerContextValue {
  showPlayer: boolean;
  setShowPlayer: (v: boolean) => void;
  trailerKey: string | null;
  setTrailerKey: (v: string | null) => void;
}

const PlayerContext = createContext<PlayerContextValue>({
  showPlayer: false,
  setShowPlayer: () => {},
  trailerKey: null,
  setTrailerKey: () => {},
});

function PlayerRoot({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  return (
    <PlayerContext.Provider value={{ showPlayer, setShowPlayer, trailerKey, setTrailerKey }}>
      <div className={cn("relative", className)} {...props}>
        {children}
      </div>
    </PlayerContext.Provider>
  );
}

function PlayerButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setShowPlayer } = useContext(PlayerContext);

  return (
    <button
      onClick={() => setShowPlayer(true)}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors text-sm",
        className
      )}
      {...props}
    >
      {children || (
        <>
          <Play className="w-4 h-4 fill-black" />
          تشغيل
        </>
      )}
    </button>
  );
}

function PlayerOverlay() {
  const { showPlayer, setShowPlayer, trailerKey } = useContext(PlayerContext);
  const [isMuted, setIsMuted] = useState(true);

  const handleClose = useCallback(() => {
    setShowPlayer(false);
  }, [setShowPlayer]);

  if (!showPlayer) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-5xl aspect-video mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {trailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&modestbranding=1&rel=0`}
            className="w-full h-full rounded-xl border-0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-zinc-900 flex items-center justify-center">
            <p className="text-zinc-500">جاري تحميل الفيديو...</p>
          </div>
        )}

        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

const Player = Object.assign(PlayerRoot, {
  Button: PlayerButton,
  Overlay: PlayerOverlay,
});

export { PlayerContext };
export default Player;
