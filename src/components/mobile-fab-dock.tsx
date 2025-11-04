"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, List, Images, Bookmark } from "lucide-react";
import { cn } from "~/lib/utils";
import { useMarketUI } from "~/stores/use-market-ui";

export function MobileFabDock() {
  const { mode, setMode, mobileViewMode, setMobileViewMode } = useMarketUI();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;

      setHasScrolled(scrollY > 50);
      setIsNearFooter(scrollY + windowHeight > documentHeight - 100); // 100px from bottom
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const base =
    "h-11 w-11 sm:h-12 sm:w-12 rounded-full shadow-xl flex items-center justify-center select-none " +
    "transition duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 " +
    "active:scale-[.97]";

  const on =
    "bg-brand-500 text-slate-900 ring-2 ring-brand-500/40 hover:bg-brand-600 active:bg-brand-700 shadow-lg";

  const off =
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 active:bg-slate-200 shadow-md";

  return (
    <div
      className={cn(
        "bottom-safe pointer-events-auto fixed right-3 z-50 gap-1.5 transition-transform duration-200 sm:right-4 md:hidden",
        hasScrolled ? "grid grid-cols-2" : "flex",
        isNearFooter ? "-translate-y-[60px]" : "translate-y-0",
      )}
      aria-label="Mobile floating actions"
    >
      {hasScrolled && (
        <>
          <button
            aria-label="Grid view"
            aria-pressed={mobileViewMode === "photo-only"}
            onClick={() => setMobileViewMode("photo-only")}
            className={cn(base, mobileViewMode === "photo-only" ? on : off)}
          >
            <LayoutGrid className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>
          <button
            aria-label="List view"
            aria-pressed={mobileViewMode === "default"}
            onClick={() => setMobileViewMode("default")}
            className={cn(base, mobileViewMode === "default" ? on : off)}
          >
            <List className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>
        </>
      )}
      <button
        aria-label="Gallery"
        aria-pressed={mode === "gallery"}
        data-state={mode === "gallery" ? "on" : "off"}
        onClick={() => setMode(mode === "gallery" ? "browse" : "gallery")}
        className={cn(base, mode === "gallery" ? on : off)}
      >
        <Images className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      </button>
      <button
        aria-label="Saved"
        aria-pressed={mode === "saved"}
        data-state={mode === "saved" ? "on" : "off"}
        onClick={() => setMode(mode === "saved" ? "browse" : "saved")}
        className={cn(base, mode === "saved" ? on : off)}
      >
        <Bookmark className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      </button>
    </div>
  );
}
