'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'فشل تسجيل الدخول';
      if (msg.includes('verify')) {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-zinc-900 p-8 rounded-xl border border-zinc-800">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">تسجيل الدخول</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2.5 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-blue-500"
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2.5 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? '...جاري' : 'دخول'}
        </button>
        <p className="text-zinc-500 text-sm text-center mt-4">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="text-blue-500 hover:underline">سجل الآن</Link>
        </p>
      </form>
    </div>
  );
}
