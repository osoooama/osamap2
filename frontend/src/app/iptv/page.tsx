'use client';

import { useEffect, useState } from 'react';

export default function IPTVPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-[#0C0C14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4A853]/20 border-t-[#D4A853] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">جاري تحميل IPTV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0C0C14]">
      <iframe
        src="http://localhost:3004"
        className="w-full h-full border-0"
        title="IPTV Live"
        allow="autoplay; fullscreen; picture-in-picture"
      />
    </div>
  );
}
