'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

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
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-zinc-300 text-sm">{user?.username}</span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
            >
              تسجيل خروج
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
            >
              دخول
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              تسجيل
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
