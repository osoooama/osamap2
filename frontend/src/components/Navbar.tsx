'use client';

import Link from 'next/link';
import { useFirebaseAuth } from '@/lib/useFirebaseAuth';

export default function Navbar() {
  const { user, logout, isSignedIn, signInWithGoogle } = useFirebaseAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-white">
          OSAMA{`>`}Dev
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/netflix" className="text-zinc-400 hover:text-white transition">Netflix</Link>
          <Link href="/shahid" className="text-zinc-400 hover:text-white transition">Shahid</Link>
          <Link href="/disney" className="text-zinc-400 hover:text-white transition">Disney+</Link>
          <Link href="/crunchyroll" className="text-zinc-400 hover:text-white transition">Crunchyroll</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.displayName?.[0] || user?.email?.[0] || '?'}
              </div>
            )}
            <span className="text-zinc-300 text-sm">{user?.displayName || user?.email}</span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
            >
              خروج
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-1.5 text-sm rounded bg-white text-zinc-900 hover:bg-zinc-100 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span>Google</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
