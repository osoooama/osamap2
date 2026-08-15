"use client";

import React, { useState, useContext, createContext, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CardContextValue {
  showFeature: boolean;
  setShowFeature: (v: boolean) => void;
  itemFeature: unknown;
  setItemFeature: (v: unknown) => void;
}

const CardContext = createContext<CardContextValue>({
  showFeature: false,
  setShowFeature: () => {},
  itemFeature: null,
  setItemFeature: () => {},
});

function CardRoot({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [showFeature, setShowFeature] = useState(false);
  const [itemFeature, setItemFeature] = useState<unknown>(null);

  return (
    <CardContext.Provider value={{ showFeature, setShowFeature, itemFeature, setItemFeature }}>
      <div className={cn("mb-8 sm:mb-10", className)} {...props}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

function CardGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-6 sm:space-y-8", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

function CardEntities({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-4", className)}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: unknown;
}

function CardItem({ item, children, className, ...props }: CardItemProps) {
  const { setShowFeature, setItemFeature } = useContext(CardContext);

  const handleClick = useCallback(() => {
    setItemFeature(item);
    setShowFeature(true);
  }, [item, setItemFeature, setShowFeature]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex-shrink-0 w-[140px] sm:w-[160px] md:w-[190px] lg:w-[220px] cursor-pointer group",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <div className={cn("relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900", className)}>
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        {...props}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

function CardMeta({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-2 space-y-0.5", className)} {...props}>
      {children}
    </div>
  );
}

interface CardFeatureProps extends React.HTMLAttributes<HTMLDivElement> {
  category?: string;
}

function CardFeature({ children, category, className, ...props }: CardFeatureProps) {
  const { showFeature, itemFeature, setShowFeature } = useContext(CardContext);
  const feature = itemFeature as Record<string, unknown> | null;

  if (!showFeature || !feature) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4",
        className
      )}
      onClick={() => setShowFeature(false)}
      {...props}
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video">
          <img
            src={(feature.backdrop_path as string) || (feature.poster_path as string) || ""}
            alt={(feature.title as string) || ""}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
        </div>
        <div className="p-6 -mt-16 relative z-10">
          <h3 className="text-2xl font-bold text-white mb-2">{(feature.title as string) || ""}</h3>
          <p className="text-zinc-400 text-sm line-clamp-3">{(feature.overview as string) || ""}</p>
          {children}
        </div>
        <button
          onClick={() => setShowFeature(false)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const Card = Object.assign(CardRoot, {
  Group: CardGroup,
  Title: CardTitle,
  Entities: CardEntities,
  Item: CardItem,
  Image: CardImage,
  Meta: CardMeta,
  Feature: CardFeature,
});

export default Card;
