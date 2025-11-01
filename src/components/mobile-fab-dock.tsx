"use client";

import { LayoutGrid, List, Images, Bookmark } from "lucide-react";
import { cn } from "~/lib/utils";
import { useMarketUI } from "~/stores/use-market-ui";

export function MobileFabDock() {
  const { mode, setMode, view, setView } = useMarketUI();

  const base =
    "h-14 w-14 rounded-full shadow-xl flex items-center justify-center select-none " +
    "transition duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 " +
    "active:scale-[.97]";

  const on =
    "bg-brand-500 text-slate-900 ring-2 ring-brand-500/40 hover:bg-brand-600 active:bg-brand-700";

  const off =
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 active:bg-slate-200";

  return (
    <div
      className="pointer-events-auto fixed right-4 bottom-[max(1rem,calc(env(safe-area-inset-bottom)+0.75rem))] z-50 flex flex-col items-center gap-2 md:hidden"
      aria-label="Mobile floating actions"
    >
      {/* View toggles ? TOP */}
      <button
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => setView("grid")}
        className={cn(base, view === "grid" ? on : off)}
      >
        <LayoutGrid className="h-6 w-6" />
      </button>
      <button
        aria-label="List view"
        aria-pressed={view === "list"}
        onClick={() => setView("list")}
        className={cn(base, view === "list" ? on : off)}
      >
        <List className="h-6 w-6" />
      </button>

      {/* Content actions ? BOTTOM (icons only) */}
      <button
        aria-label="Gallery"
        aria-pressed={mode === "gallery"}
        data-state={mode === "gallery" ? "on" : "off"}
        onClick={() => setMode(mode === "gallery" ? "browse" : "gallery")}
        className={cn(base, mode === "gallery" ? on : off)}
      >
        <Images className="h-6 w-6" />
      </button>
      <button
        aria-label="Saved"
        aria-pressed={mode === "saved"}
        data-state={mode === "saved" ? "on" : "off"}
        onClick={() => setMode(mode === "saved" ? "browse" : "saved")}
        className={cn(base, mode === "saved" ? on : off)}
      >
        <Bookmark className="h-6 w-6" />
      </button>
    </div>
  );
}
