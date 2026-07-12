'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (!dismissed) {
      const timer = setTimeout(() => {
        if (!deferredPrompt && !isIOS) setShow(false);
        else if (isIOS && !dismissed) setShow(true);
      }, 5000);
      return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', handler); };
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed, deferredPrompt, isIOS]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') setShow(false);
      setDeferredPrompt(null);
    }
  };

  if (!show || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-[9999] max-w-sm mx-auto"
      >
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/60">
          <button onClick={() => { setShow(false); setDismissed(true); }} className="absolute top-3 left-3 text-zinc-500 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div dir="auto">
              <h3 className="text-white font-bold text-sm mb-1 mixed-text">ثبّت OSK+</h3>
              <p className="text-zinc-400 text-xs leading-relaxed mixed-text" dir="auto">
                {isIOS
                  ? 'اضغط على زر المشاركة 🧷 ثم اختر "إضافة إلى الشاشة الرئيسية"'
                  : 'حسّن تجربتك مع تطبيق OSK+ على شاشتك الرئيسية'}
              </p>
            </div>
          </div>

          {!isIOS && deferredPrompt && (
            <button onClick={handleInstall} className="mt-3 w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
              <Smartphone className="w-4 h-4" />
              تثبيت التطبيق
            </button>
          )}

          {isIOS && (
            <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-500 bg-zinc-950/50 rounded-xl p-3 border border-white/5">
              <Monitor className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              <span dir="auto">Safari → زر المشاركة → إضافة إلى الشاشة الرئيسية</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
