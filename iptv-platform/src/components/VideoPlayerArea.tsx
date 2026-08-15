"use client";

import { Tv } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import type { ChannelStream } from "@/types/xtream";

interface VideoPlayerAreaProps {
  selectedStream: ChannelStream | null;
  isPlayerOpen: boolean;
  onClosePlayer: () => void;
}

export const VideoPlayerArea = ({
  selectedStream,
  isPlayerOpen,
  onClosePlayer,
}: VideoPlayerAreaProps) => {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {selectedStream && isPlayerOpen ? (
        <div className="h-full w-full bg-black">
          <VideoPlayer
            streamUrl={selectedStream.streamUrl}
            channelName={selectedStream.name}
            isOpen={true}
            onClose={onClosePlayer}
            isEmbedded={true}
          />
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
