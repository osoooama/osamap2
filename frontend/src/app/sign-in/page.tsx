'use client';

import { useSignIn, useSignUp, useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToastStore } from '@/lib/useToast';

export default function SignInPage() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { signUp } = useSignUp();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const { addToast } = useToastStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isSignedIn) router.push('/netflix');
  }, [isSignedIn, router]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn || !signUp) return;
    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({ identifier: email });
      const emailFactor = result.supportedFirstFactors?.find(
        (f: any) => f.strategy === 'email_code'
      );
      if (!emailFactor) {
        setIsNewUser(true);
        await signUp.create({ emailAddress: email });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setStep('code');
        setResendTimer(30);
        return;
      }
      setIsNewUser(false);
      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: (emailFactor as any).emailAddressId,
      });
      setStep('code');
      setResendTimer(30);
    } catch (err: any) {
      const code = err?.errors?.[0]?.code;
      if (code === 'form_identifier_not_found') {
        setIsNewUser(true);
        try {
          await signUp.create({ emailAddress: email });
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setStep('code');
          setResendTimer(30);
        } catch (e2: any) {
          setError(e2?.errors?.[0]?.message || 'فشل إنشاء الحساب');
        }
      } else {
        setError(err?.errors?.[0]?.message || 'فشل إرسال الكود');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!signIn || !signUp) return;
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;
    setLoading(true);
    setError('');

    try {
      let sessionId: string | null = null;
      if (isNewUser) {
        const result = await signUp.attemptEmailAddressVerification({ code: fullCode });
        if (result.status === 'complete') {
          sessionId = result.createdSessionId;
        }
      } else {
        const result = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: fullCode,
        });
        if (result.status === 'complete') {
          sessionId = result.createdSessionId;
        }
      }
      if (sessionId) {
        await setActive({ session: sessionId });
        setStep('success');
        addToast({
          title: isNewUser ? 'أهلاً بك! 🎉' : 'مرحباً بعودتك! 👋',
          description: isNewUser ? 'تم إنشاء الحساب بنجاح' : 'تم تسجيل الدخول بنجاح',
          type: 'success',
        });
        setTimeout(() => router.push('/netflix'), 1200);
      } else {
        setError('الكود غير صحيح. حاول مرة أخرى.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'فشل التحقق من الكود');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newCode.every((d) => d !== '') && value) {
      setTimeout(handleVerifyCode, 150);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!signIn || !signUp || resendTimer > 0) return;
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    try {
      if (isNewUser) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      } else {
        const emailFactor = (signIn as any).supportedFirstFactors?.find(
          (f: any) => f.strategy === 'email_code'
        );
        if (emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: (emailFactor as any)?.emailAddressId,
          });
        }
      }
      setResendTimer(30);
    } catch {
      setError('فشل إعادة إرسال الكود');
    }
  };

  if (!mounted) return null;

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <p className="text-white text-xl font-bold">جاري تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden px-4">
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-red-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-red-600 flex items-center justify-center font-black text-white text-2xl mx-auto mb-4 shadow-lg shadow-red-600/30">
            O
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            OSAMA/<span className="text-red-500">Dev</span>
          </h1>
          <p className="text-zinc-500">
            {step === 'email' ? 'أدخل بريدك الإلكتروني لبدء التسجيل' : 'أدخل رمز التحقق المرسل إلى بريدك'}
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-8 border border-white/10">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    dir="ltr"
                    className="w-full pr-10 pl-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/50 transition placeholder:text-zinc-700"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold transition-all disabled:opacity-50 shadow-lg shadow-red-600/25"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <button
                onClick={() => { setStep('email'); setError(''); }}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                تغيير البريد الإلكتروني
              </button>

              <div dir="ltr" className="flex justify-center gap-2.5">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-bold rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition placeholder:text-zinc-700"
                    placeholder="•"
                  />
                ))}
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button
                onClick={handleVerifyCode}
                disabled={loading || code.some((d) => d === '')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold transition-all disabled:opacity-50 shadow-lg shadow-red-600/25"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {loading ? 'جاري التحقق...' : 'تأكيد الكود'}
              </button>

              <p className="text-center text-sm text-zinc-500">
                لم يصلك الكود؟{' '}
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className="text-red-400 hover:text-red-300 transition disabled:text-zinc-600 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `أعد المحاولة بعد ${resendTimer} ثانية` : 'إعادة الإرسال'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
