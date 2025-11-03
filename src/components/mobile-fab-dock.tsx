"use client";

import { LayoutGrid, List, Images, Bookmark, Grid3x3, Image as ImageIcon, Filter, ArrowUpDown, Square, FileText } from "lucide-react";
import { cn } from "~/lib/utils";
import { useMarketUI } from "~/stores/use-market-ui";

export function MobileFabDock() {
  const { mode, setMode, view, setView, mobileViewMode, setMobileViewMode, cardViewMode, setCardViewMode } = useMarketUI();

  const base =
    "h-11 w-11 sm:h-12 sm:w-12 rounded-full shadow-xl flex items-center justify-center select-none " +
    "transition duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 " +
    "active:scale-[.97]";

  const on =
    "bg-brand-500 text-slate-900 ring-2 ring-brand-500/40 hover:bg-brand-600 active:bg-brand-700 shadow-lg";

  const off =
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 active:bg-slate-200 shadow-md";

  const handleFilter = () => {
    // Scroll to filter bar
    const filterBar = document.getElementById("filter-bar");
    if (filterBar) {
      filterBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSort = () => {
    // Toggle sort menu or scroll to sort options
    const categoryChips = document.querySelector('[role="tablist"]');
    if (categoryChips) {
      categoryChips.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      className="bottom-safe pointer-events-auto fixed right-3 sm:right-4 z-50 flex flex-col items-center gap-1.5 md:hidden"
      aria-label="Mobile floating actions"
    >
      {/* Filter & Sort - TOP */}
      <div className="flex flex-col items-center gap-1 mb-1">
        <span className="text-xs text-slate-500 font-medium">Actions</span>
        <div className="flex gap-1">
          <button
            aria-label="Filter prompts"
            onClick={handleFilter}
            className={cn(base, "h-9 w-9 sm:h-10 sm:w-10", off)}
            title="Filter prompts"
          >
            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            aria-label="Sort prompts"
            onClick={handleSort}
            className={cn(base, "h-9 w-9 sm:h-10 sm:w-10", off)}
            title="Sort prompts"
          >
            <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      <div className="w-px h-px bg-slate-300 my-0.5"></div>

      {/* Mobile View Mode Toggles */}
      <div className="flex flex-col items-center gap-1 mb-1">
        <span className="text-xs text-slate-500 font-medium">View</span>
        <div className="flex gap-1">
          <button
            aria-label="Default view"
            aria-pressed={mobileViewMode === "default"}
            onClick={() => setMobileViewMode("default")}
            className={cn(base, "h-9 w-9 sm:h-10 sm:w-10", mobileViewMode === "default" ? on : off)}
            title="Default card view"
          >
            <Grid3x3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            aria-label="Photo only view"
            aria-pressed={mobileViewMode === "photo-only"}
            onClick={() => setMobileViewMode("photo-only")}
            className={cn(base, "h-9 w-9 sm:h-10 sm:w-10", mobileViewMode === "photo-only" ? on : off)}
            title="Photo only view"
          >
            <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      <div className="w-px h-px bg-slate-300 my-0.5"></div>

      {/* Card View Mode */}
      <div className="flex flex-col items-center gap-1 mb-1">
        <span className="text-xs text-slate-500 font-medium">Cards</span>
        <div className="flex gap-1">
          <button
            aria-label="Image only view"
            aria-pressed={cardViewMode === "image-only"}
            onClick={() => setCardViewMode(cardViewMode === "image-only" ? "default" : "image-only")}
            className={cn(base, "h-9 w-9 sm:h-10 sm:w-10", cardViewMode === "image-only" ? on : off)}
            title="Image only view"
          >
            <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            aria-label="Full description view"
            aria-pressed={cardViewMode === "full-description"}
            onClick={() => setCardViewMode(cardViewMode === "full-description" ? "default" : "full-description")}
            className={cn(base, "h-9 w-9 sm:h-10 sm:w-10", cardViewMode === "full-description" ? on : off)}
            title="Full description view"
          >
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>

      <div className="w-px h-px bg-slate-300 my-0.5"></div>

      {/* View toggles */}
      <button
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => setView("grid")}
        className={cn(base, view === "grid" ? on : off)}
      >
        <LayoutGrid className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      </button>
      <button
        aria-label="List view"
        aria-pressed={view === "list"}
        onClick={() => setView("list")}
        className={cn(base, view === "list" ? on : off)}
      >
        <List className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      </button>

      <div className="w-px h-px bg-slate-300 my-0.5"></div>

      {/* Content actions ? BOTTOM (icons only) */}
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
