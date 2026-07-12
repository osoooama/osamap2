'use client';

import { useAuth } from '@clerk/clerk-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const publicPages = ['/', '/sign-in'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !isSignedIn && !publicPages.includes(pathname)) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router, pathname]);

  if (!isLoaded || (!isSignedIn && !publicPages.includes(pathname))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin absolute inset-0 opacity-50" style={{ animationDirection: 'reverse' }} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
