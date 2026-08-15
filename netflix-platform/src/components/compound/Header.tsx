"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  bg?: boolean;
}

function HeaderRoot({ bg = true, children, className, ...props }: HeaderProps) {
  return bg ? (
    <header
      className={cn(
        "relative w-full bg-gradient-to-b from-black/80 via-black/50 to-transparent",
        className
      )}
      {...props}
    >
      {children}
    </header>
  ) : (
    <>{children}</>
  );
}

function HeaderFrame({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function HeaderGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-3 sm:gap-5", className)} {...props}>
      {children}
    </div>
  );
}

function HeaderLogo({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#E50914] tracking-tighter">
        NETFLIX
      </span>
    </div>
  );
}

interface HeaderLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function HeaderLink({ active, children, className, ...props }: HeaderLinkProps) {
  return (
    <button
      className={cn(
        "text-xs sm:text-sm font-medium transition-colors duration-200",
        active ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface HeaderSearchProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  className?: string;
}

function HeaderSearch({ searchTerm, setSearchTerm, className }: HeaderSearchProps) {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <div className={cn("relative flex items-center", className)}>
      <button
        onClick={() => setSearchActive(!searchActive)}
        className="text-zinc-400 hover:text-white transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="البحث عن أفلام ومسلسلات..."
        className={cn(
          "bg-zinc-900/80 border border-zinc-700 text-white text-sm rounded-lg pl-9 pr-3 py-1.5 ml-2 transition-all duration-300 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500",
          searchActive ? "w-48 sm:w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"
        )}
      />
      {searchActive && searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute left-2 text-zinc-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface HeaderFeatureProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onPlay?: () => void;
}

function HeaderFeature({ title, description, onPlay, children, className, ...props }: HeaderFeatureProps) {
  return (
    <div className={cn("px-4 sm:px-8 md:px-12 lg:px-16 pb-8 pt-4", className)} {...props}>
      {title && (
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 drop-shadow-2xl">
          {title}
        </h1>
      )}
      {description && (
        <p className="text-zinc-300 text-sm sm:text-base max-w-xl line-clamp-3 mb-4">{description}</p>
      )}
      {onPlay && (
        <button
          onClick={onPlay}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors text-sm"
        >
          ▶ تشغيل
        </button>
      )}
      {children}
    </div>
  );
}

const Header = Object.assign(HeaderRoot, {
  Frame: HeaderFrame,
  Group: HeaderGroup,
  Logo: HeaderLogo,
  Link: HeaderLink,
  Search: HeaderSearch,
  Feature: HeaderFeature,
});

export default Header;
