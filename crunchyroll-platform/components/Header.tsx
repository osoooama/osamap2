"use client";

import { useState } from "react";
import { Search, Menu, X, Home, Compass, Flame, Clock, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Browse", icon: Compass, href: "/" },
  { label: "Popular", icon: Flame, href: "/#popular" },
  { label: "New", icon: Clock, href: "/#new" },
  { label: "Simulcasts", icon: Tv, href: "/#simulcasts" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-6 sm:gap-8">
            <a href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#F47521] flex items-center justify-center shadow-lg shadow-[#F47521]/30 group-hover:shadow-[#F47521]/50 transition-shadow">
                  <span className="text-white text-xs sm:text-sm font-black tracking-tighter">CR</span>
                </div>
              </div>
              <span className="hidden sm:block text-white font-bold text-sm tracking-wide">
                CRUNCHY<span className="text-[#F47521]">ROLL</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-zinc-400 hover:text-[#F47521] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <a
              href="/search"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F47521]/10 border border-[#F47521]/20 text-[#F47521] text-sm font-medium hover:bg-[#F47521]/20 transition-all"
            >
              <Search className="w-4 h-4" />
              Search Anime
            </a>

            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </a>
              );
            })}
            <a
              href="/search"
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#F47521] hover:bg-[#F47521]/10 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              <Search className="w-4 h-4" />
              Search Anime
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
