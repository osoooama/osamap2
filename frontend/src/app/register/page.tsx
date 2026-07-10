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
          <h1 className="text-3xl font-bold text-white">إنشاء حساب جديد</h1>
          <p className="text-zinc-500 mt-1">استمتع بتجربة بث متكاملة</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-xl">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 mb-4 text-center">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="text-zinc-400 text-sm mb-1.5 block">اسم المستخدم</label>
            <input
              type="text"
              placeholder="اختر اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-blue-600 transition"
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
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-blue-600 transition"
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
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-blue-600 transition"
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

        <p className="text-center mt-6 text-zinc-500 text-sm">
          لديك حساب؟{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-400 transition font-medium">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
