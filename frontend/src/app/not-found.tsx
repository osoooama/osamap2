'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center">
          <span className="text-5xl font-black text-zinc-700">404</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">الصفحة غير موجودة</h1>
        <p className="text-zinc-500 text-sm mb-6">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
