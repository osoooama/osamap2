"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Heart, Tv, Menu, X } from "lucide-react";
import { clsx } from "clsx";

interface NavbarProps {
  activePage?: "home" | "search" | "favorites";
}

export function Navbar({ activePage = "home" }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <span className="text-gradient-gold font-bold text-lg tracking-tight">
              IPTV
            </span>
            <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
              LIVE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={activePage === "home"}>Home</NavLink>
            <NavLink href="/search" active={activePage === "search"}>
              <Search className="w-3.5 h-3.5" />
              Search
            </NavLink>
            <NavLink href="/favorites" active={activePage === "favorites"}>
              <Heart className="w-3.5 h-3.5" />
              Favorites
            </NavLink>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-white/5 px-4 py-3 space-y-1">
          <MobileNavLink href="/" onClick={() => setMobileOpen(false)} active={activePage === "home"}>Home</MobileNavLink>
          <MobileNavLink href="/search" onClick={() => setMobileOpen(false)} active={activePage === "search"}>
            <Search className="w-4 h-4" /> Search
          </MobileNavLink>
          <MobileNavLink href="/favorites" onClick={() => setMobileOpen(false)} active={activePage === "favorites"}>
            <Heart className="w-4 h-4" /> Favorites
          </MobileNavLink>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
        active
          ? "text-primary bg-primary/10 border border-primary/20"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, active, onClick, children }: { href: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active ? "text-primary bg-primary/10" : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </Link>
  );
}
