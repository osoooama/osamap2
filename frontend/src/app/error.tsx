'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span className="text-4xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">حدث خطأ</h1>
        <p className="text-zinc-500 text-sm mb-6">
          {error.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/25"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
