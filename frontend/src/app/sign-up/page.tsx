'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const { user, register } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (user) router.push('/netflix');
  }, [user, router]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('أدخل اسم المستخدم وكلمة المرور');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (password.length < 4) {
      setError('كلمة المرور يجب أن تكون 4 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      await register(username.trim(), password);
      router.push('/netflix');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'فشل التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden px-4">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-teal-600/10 rounded-full blur-[150px]" />
        </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2, type: 'spring' }}
            className="text-5xl font-black text-white mb-2 font-arabic-display"
          >
            OSK<span className="text-emerald-500">+</span>
          </motion.h1>
          <p className="text-zinc-500 text-sm">أنشئ حسابك وابدأ المشاهدة</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/30 p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/15 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">حساب جديد</h2>
                <p className="text-zinc-500 text-xs">اختر اسم مستخدم وكلمة مرور</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-sm font-medium">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="اسم المستخدم"
                    className="w-full bg-zinc-950 border border-white/10 text-white rounded-xl py-3 px-10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition placeholder:text-zinc-600 text-base"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 text-sm font-medium">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-white/10 text-white rounded-xl py-3 px-10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition placeholder:text-zinc-600 text-base"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 text-sm font-medium">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-white/10 text-white rounded-xl py-3 px-10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition placeholder:text-zinc-600 text-base"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  إنشاء الحساب
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          لديك حساب بالفعل؟{' '}
          <Link href="/sign-in" className="text-emerald-400 hover:text-emerald-300 font-medium transition">
            سجّل الدخول
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
