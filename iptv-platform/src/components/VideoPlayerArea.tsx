"use client";

import { Tv, ChevronLeft, ChevronRight } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import type { ChannelStream } from "@/types/xtream";

interface VideoPlayerAreaProps {
  selectedStream: ChannelStream | null;
  isPlayerOpen: boolean;
  onClosePlayer: () => void;
  onNextChannel?: () => void;
  onPrevChannel?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  channelName?: string;
  channelIndex?: number;
  totalChannels?: number;
}

export const VideoPlayerArea = ({
  selectedStream,
  isPlayerOpen,
  onClosePlayer,
  onNextChannel,
  onPrevChannel,
  hasNext,
  hasPrev,
  channelName,
  channelIndex,
  totalChannels,
}: VideoPlayerAreaProps) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {selectedStream && isPlayerOpen ? (
        <div className="flex flex-col h-full">
          <div className="flex-1 min-h-0 bg-black relative">
            <VideoPlayer
              streamUrl={selectedStream.streamUrl}
              channelName={selectedStream.name}
              isOpen={true}
              onClose={onClosePlayer}
              isEmbedded={true}
            />
          </div>
          <div className="flex items-center justify-between bg-surface-light px-4 py-2 border-t border-white/5">
            <button
              onClick={onPrevChannel}
              disabled={!hasPrev}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-arabic"
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </button>
            <span className="text-xs text-slate-500 font-arabic">
              {channelName} — {channelIndex}/{totalChannels}
            </span>
            <button
              onClick={onNextChannel}
              disabled={!hasNext}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-arabic"
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-surface">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-surface-light border border-white/5 flex items-center justify-center mx-auto mb-5">
              <Tv className="h-10 w-10 text-primary/30" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 font-arabic">مشغل الفيديو</h3>
            <p className="text-sm text-slate-500 font-arabic">اختر قناة للمشاهدة</p>
          </div>
        </div>
      )}
    </div>
  );
};
