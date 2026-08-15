"use client";

import { cn } from "@/lib/utils";

const GENRES = [
  { label: "الكل", value: "all" },
  { label: "أكشن", value: "28" },
  { label: "مغامرة", value: "12" },
  { label: "كوميدي", value: "35" },
  { label: "دراما", value: "18" },
  { label: "رعب", value: "27" },
  { label: "خيال علمي", value: "878" },
  { label: "رومانسي", value: "10749" },
  { label: "حركة", value: "53" },
  { label: "عائلي", value: "10751" },
  { label: "وثائقي", value: "99" },
  { label: "أنيميشن", value: "16" },
];

interface GenrePillsProps {
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}

export default function GenrePills({ selected, onSelect, className }: GenrePillsProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0",
        className
      )}
    >
      {GENRES.map((g) => (
        <button
          key={g.value}
          onClick={() => onSelect(g.value)}
          className={cn(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border",
            selected === g.value
              ? "bg-white text-black border-white"
              : "bg-transparent text-zinc-400 border-white/20 hover:border-white/50 hover:text-white"
          )}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

export { GENRES };
