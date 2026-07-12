'use client';

import { SignIn } from '@clerk/clerk-react';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignInPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isSignedIn) router.push('/netflix');
  }, [isSignedIn, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden px-4">
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-red-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-red-600 flex items-center justify-center font-black text-white text-2xl mx-auto mb-4 shadow-lg shadow-red-600/30">
            O
          </div>
          <h1 className="text-3xl font-black text-white mb-1">
            OSAMA/<span className="text-red-500">Dev</span>
          </h1>
          <p className="text-zinc-500 text-sm">سجل دخولك للوصول إلى المنصة</p>
        </div>

        <SignIn
          signUpUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/30 p-6',
              headerTitle: 'text-white text-lg font-bold',
              headerSubtitle: 'text-zinc-400 text-sm',
              socialButtonsBlockButton: 'bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white rounded-xl py-3',
              socialButtonsBlockButtonText: 'text-white font-medium',
              dividerLine: 'bg-white/10',
              dividerText: 'text-zinc-500 text-xs',
              formFieldLabel: 'text-zinc-400 text-sm',
              formFieldInput: 'bg-zinc-950 border border-white/10 text-white rounded-xl py-3 px-4 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30',
              formButtonPrimary: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl py-3 font-semibold shadow-lg shadow-red-600/25 transition-all',
              footerActionText: 'text-zinc-500 text-sm',
              footerActionLink: 'text-red-400 hover:text-red-300 transition',
              identityPreviewText: 'text-zinc-300',
              identityPreviewEditButton: 'text-red-400 hover:text-red-300',
              otpCodeFieldInput: 'bg-zinc-950 border border-white/10 text-white rounded-xl focus:border-red-500/50',
              formFieldErrorText: 'text-red-400 text-sm',
              formFieldSuccessText: 'text-emerald-400 text-sm',
              alert: 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl',
              profileSectionTitleText: 'text-zinc-300',
              profileSectionContent: 'text-zinc-400',
              userPreviewMainIdentifier: 'text-white',
              userPreviewSecondaryIdentifier: 'text-zinc-500',
            },
          }}
        />
      </div>
    </div>
  );
}
