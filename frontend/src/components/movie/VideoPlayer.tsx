'use client';
import { useSettingsStore } from '@/stores/settings';
import ReactPlayer from 'react-player';
import { useEffect, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  subtitleUrl?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ src, subtitleUrl, autoPlay = true }: VideoPlayerProps) {
  const settings = useSettingsStore();
  const [subtitles, setSubtitles] = useState<string>('');

  useEffect(() => {
    if (subtitleUrl) {
      fetch(subtitleUrl).then(r => r.text()).then(setSubtitles);
    }
  }, [subtitleUrl]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <ReactPlayer
        src={src}
        width="100%"
        height="100%"
        playing={autoPlay}
        controls
      />
      {settings.subtitleEnabled && subtitles && (
        <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none">
          <div className="inline-block px-4 py-2 bg-black/70 rounded-lg">
            <span
              className="text-lg"
              style={{
                color: settings.subtitleColor,
                fontSize: settings.subtitleFontSize === 'small' ? '14px' : settings.subtitleFontSize === 'large' ? '24px' : '18px',
                backgroundColor: settings.subtitleBackground === 'transparent' ? 'transparent' : settings.subtitleBackground === 'dark' ? 'rgba(0,0,0,0.5)' : 'black',
                padding: settings.subtitleBackground !== 'transparent' ? '4px 8px' : '0',
                borderRadius: settings.subtitleBackground !== 'transparent' ? '4px' : '0',
              }}
            >
              {subtitles}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
