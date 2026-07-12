'use client';

import { useSignIn, useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToastStore } from '@/lib/useToast';
import Image from 'next/image';

export default function SignInPage() {
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const { addToast } = useToastStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isSignedIn && !showWelcome) {
      addToast({ title: 'مرحباً بعودتك 👋', description: 'أهلاً بك في OSK+', type: 'success' });
      const timer = setTimeout(() => router.push('/netflix'), 800);
      return () => clearTimeout(timer);
    }
  }, [isSignedIn]);

  if (!mounted || !userLoaded || !signInLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin absolute inset-0 opacity-50" style={{ animationDirection: 'reverse' }} />
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-white text-lg font-semibold">تم تسجيل الدخول بنجاح</p>
          <p className="text-zinc-500 text-sm mt-1">جاري تحويلك...</p>
        </motion.div>
      </div>
    );
  }

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }
    setLoading(true);
    try {
      const signInAttempt = await signIn.create({ identifier: email });
      const emailFactor: any = signInAttempt.supportedFirstFactors?.find(
        (f: any) => f.strategy === 'email_code'
      );
      await signInAttempt.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: emailFactor!.emailAddressId,
      } as any);
      setStep('verify');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e?: FormEvent) => {
    e?.preventDefault();
    setError('');
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('الرجاء إدخال رمز التحقق كاملاً');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: fullCode,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setShowWelcome(true);
        addToast({ title: 'مرحباً بعودتك 👋', description: 'أهلاً بك في OSK+', type: 'success' });
        setTimeout(() => router.push('/netflix'), 800);
      } else {
        setError('فشل التحقق، حاول مرة أخرى');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'رمز التحقق غير صحيح، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (value && index === 5) {
      const fullCode = [...newCode].join('');
      if (fullCode.length === 6) {
        handleVerify();
      }
    }
  };

  const handleCodeKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
    if (pasted.length === 6) {
      handleVerify();
    }
  };

  const resetForm = () => {
    setStep('email');
    setCode(['', '', '', '', '', '']);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden px-4">
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-red-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-2xl mx-auto mb-4 overflow-hidden ring-2 ring-white/10 shadow-xl shadow-red-600/20"
          >
            <Image
              src="/logo.jpg"
              alt="OSK+"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              priority
            />
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
            OSK<span className="text-red-500">+</span>
          </h1>
          <p className="text-zinc-500 text-sm">سجل دخولك للوصول إلى المنصة</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/30 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSendCode}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-600/15 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">البريد الإلكتروني</h2>
                    <p className="text-zinc-500 text-xs">أدخل بريدك لاستلام رمز التحقق</p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-6">
                  <label className="text-zinc-400 text-sm font-medium">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    dir="ltr"
                    className="w-full bg-zinc-950 border border-white/10 text-white rounded-xl py-3 px-4 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none transition placeholder:text-zinc-600 text-base"
                    autoFocus
                  />
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
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      إرسال رمز التحقق
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerify}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition text-sm mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  تغيير البريد
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/15 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">رمز التحقق</h2>
                    <p className="text-zinc-500 text-xs">أدخل الرقم المكون من 6 أرقام</p>
                  </div>
                </div>

                <p className="text-zinc-400 text-sm text-center mb-5">
                  تم إرسال الرمز إلى
                  <span className="text-white font-medium block mt-0.5">{email}</span>
                </p>

                <div className="flex items-center justify-center gap-2 mb-6" dir="ltr">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      onPaste={i === 0 ? handleCodePaste : undefined}
                      className="w-12 h-14 sm:w-14 sm:h-16 bg-zinc-950 border border-white/10 text-white text-center text-2xl font-bold rounded-xl outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                      autoFocus={i === 0}
                    />
                  ))}
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
                      <CheckCircle className="w-4 h-4" />
                      تأكيد وتسجيل الدخول
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          باستخدام OSK+ فإنك توافق على{' '}
          <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition">شروط الخدمة</span>
        </p>
      </motion.div>
    </div>
  );
}
