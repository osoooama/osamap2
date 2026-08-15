"use client";

import { useState } from "react";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

const NAV_LINKS = [
  { label: "الرئيسية", href: "#", active: true },
  { label: "أفلام", href: "#" },
  { label: "مسلسلات", href: "#" },
  { label: "عربي", href: "#" },
  { label: "تركي", href: "#" },
  { label: "الأكثر مشاهدة", href: "#" },
];

export default function Navbar({ className }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-gradient-to-b from-[#0A2818] via-[#0A2818]/98 to-[#0A2818]/90",
        "backdrop-blur-xl border-b border-white/5",
        className
      )}
      dir="rtl"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#C9A96E] to-[#B8944F] flex items-center justify-center shadow-lg shadow-[#C9A96E]/20">
                <span className="text-[#0A2818] text-sm sm:text-base font-black">ش</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                شاهد
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    link.active
                      ? "text-[#C9A96E] bg-[#C9A96E]/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-sm hover:bg-white/10 hover:text-white transition-all">
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
        <div className="md:hidden border-t border-white/5 bg-[#0A2818]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                className={cn(
                  "block w-full text-right px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  link.active
                    ? "text-[#C9A96E] bg-[#C9A96E]/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
