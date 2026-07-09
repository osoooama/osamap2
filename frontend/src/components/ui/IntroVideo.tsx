'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroVideoProps {
  src: string;
  onComplete: () => void;
  skipText?: string;
  autoPlay?: boolean;
}

export function IntroVideo({ src, onComplete, skipText = 'تخطي', autoPlay = true }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-cover"
            playsInline
            muted
            onEnded={() => {
              setIsVisible(false);
              setTimeout(onComplete, 300);
            }}
          />
          <button
            onClick={handleSkip}
            className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-sm hover:bg-white/20 transition"
          >
            {skipText}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
