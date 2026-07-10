'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/api/auth/verify', { email, code });
      setMessage('تم التحقق بنجاح!');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      await api.post('/api/auth/resend', { email });
      setMessage('تم إرسال رمز جديد');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل إعادة الإرسال');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-xl border border-zinc-800">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">تحقق من بريدك</h1>
        <p className="text-zinc-400 text-sm text-center mb-6">
          أدخل رمز التحقق المرسل إلى <span className="text-zinc-200">{email}</span>
        </p>
        {message && <p className="text-green-500 text-sm mb-4 text-center">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="رمز التحقق (6 أرقام)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full mb-6 px-4 py-2.5 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-blue-500 text-center text-lg tracking-widest"
            maxLength={6}
            required
          />
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-2.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 mb-3"
          >
            {loading ? '...جاري' : 'تحقق'}
          </button>
        </form>
        <button
          onClick={handleResend}
          className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition"
        >
          إعادة إرسال الرمز
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-950"><p className="text-zinc-400">جاري التحميل...</p></div>}>
      <VerifyContent />
    </Suspense>
  );
}
