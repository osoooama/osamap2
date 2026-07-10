'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(email, username, password);
      if (res?.autoVerified) {
        router.push('/');
      } else {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            O
          </div>
          <h1 className="text-3xl font-bold text-white">إنشاء حساب جديد</h1>
          <p className="text-zinc-500 mt-1">استمتع بتجربة بث متكاملة</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-xl">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span>التسجيل عبر Google</span>
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-500 text-sm">أو</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-zinc-400 text-sm mb-1.5 block">اسم المستخدم</label>
              <input
                type="text"
                placeholder="اختر اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-zinc-400 text-sm mb-1.5 block">البريد الإلكتروني</label>
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                required
              />
            </div>
            <div className="mb-6">
              <label className="text-zinc-400 text-sm mb-1.5 block">كلمة المرور</label>
              <input
                type="password"
                placeholder="أنشئ كلمة مرور قوية"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 shadow-lg"
            >
              {loading ? '...جاري التحميل' : 'إنشاء حساب'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-zinc-500 text-sm">
          لديك حساب؟{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-400 transition font-medium">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
