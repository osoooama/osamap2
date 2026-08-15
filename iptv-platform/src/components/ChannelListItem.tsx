"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { Play, ExternalLink, Heart, HeartOff } from "lucide-react";
import type { ChannelStream } from "@/types/xtream";

interface ChannelListItemProps {
  stream: ChannelStream;
  onPlay: (stream: ChannelStream) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isActive: boolean;
}

export const ChannelListItem = ({
  stream,
  onPlay,
  isFavorite,
  onToggleFavorite,
  isActive,
}: ChannelListItemProps) => {
  const [imageError, setImageError] = useState(false);
  const handlePlayClick = useCallback(() => onPlay(stream), [onPlay, stream]);

  const handleExternalClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(stream.streamUrl, "_blank", "noopener,noreferrer");
    },
    [stream.streamUrl]
  );

  return (
    <div
      className={clsx(
        "group flex items-center gap-2.5 rounded-xl p-2 transition-all duration-200 cursor-pointer",
        isActive
          ? "bg-primary/15 border border-primary/20 shadow-sm shadow-primary/10"
          : "hover:bg-white/5 border border-transparent hover:border-white/5"
      )}
      onClick={handlePlayClick}
    >
      {/* Channel Logo */}
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-surface-lighter to-surface-light border border-white/5">
        {stream.streamIcon && !imageError ? (
          <Image
            src={stream.streamIcon}
            alt={stream.name}
            fill
            sizes="36px"
            className="object-contain p-0.5"
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs font-bold text-slate-500">{stream.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {isActive && (
          <div className="absolute inset-0 bg-primary/10 rounded-lg" />
        )}
      </div>

      {/* Channel Info */}
      <div className="flex-1 min-w-0">
        <h3 className={clsx(
          "truncate text-xs font-semibold transition-colors",
          isActive ? "text-primary" : "text-white group-hover:text-primary-light"
        )}>
          {stream.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className={clsx(
            "h-1 w-1 rounded-full",
            isActive ? "bg-live animate-live" : "bg-emerald-500/50"
          )} />
          <span className="text-[10px] text-slate-500">
            {isActive ? "بث مباشر" : "مباشر"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={clsx(
            "rounded-lg p-1.5 transition-all",
            isFavorite ? "text-primary hover:text-primary-light" : "text-slate-500 hover:text-slate-300"
          )}
        >
          {isFavorite ? <Heart className="h-3 w-3" /> : <HeartOff className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={handleExternalClick}
          className="rounded-lg p-1.5 text-slate-500 hover:text-white transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={handlePlayClick}
          className={clsx(
            "rounded-lg bg-primary p-1.5 text-white hover:bg-primary-light transition-all",
            isActive && "shadow-sm shadow-primary/30"
          )}
        >
          <Play className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
