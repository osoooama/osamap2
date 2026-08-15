"use client";

import { useState } from "react";
import { Search, Menu, X, Home, Film, Tv, Sparkles, Star, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

const NAV_LINKS = [
  { label: "الرئيسية", icon: Home, active: true },
  { label: "أفلام", icon: Film },
  { label: "مسلسلات", icon: Tv },
  { label: "ديزني", icon: Sparkles },
  { label: "مارفل", icon: Star },
  { label: "ستار وورز", icon: Compass },
];

export default function Navbar({ className }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-gradient-to-b from-[#0C111B] via-[#0C111B]/98 to-[#0C111B]/90",
        "backdrop-blur-xl border-b border-[#0063E5]/10",
        className
      )}
      dir="rtl"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-8 sm:w-12 sm:h-9 rounded-lg bg-gradient-to-br from-[#0063E5] via-[#1F1F4B] to-[#0063E5] flex items-center justify-center shadow-lg shadow-[#0063E5]/30 overflow-hidden">
                  <span className="text-white text-[10px] sm:text-xs font-black tracking-widest">Disney+</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#0063E5] animate-pulse" />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                      link.active
                        ? "text-white bg-[#0063E5]/20 border border-[#0063E5]/30"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-sm hover:bg-[#0063E5]/10 hover:text-white hover:border-[#0063E5]/30 transition-all">
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">البحث</span>
            </button>

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
        <div className="md:hidden border-t border-[#0063E5]/10 bg-[#0C111B]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  className={cn(
                    "flex items-center gap-2 w-full text-right px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    link.active
                      ? "text-white bg-[#0063E5]/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
