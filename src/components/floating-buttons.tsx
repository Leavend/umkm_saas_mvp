// src/components/floating-buttons.tsx

"use client";

import { Images, Bookmark, Square, FileText } from "lucide-react";
import { cn } from "~/lib/utils";
import { useMarketUI } from "~/stores/use-market-ui";

interface FloatingButtonsProps {
  className?: string;
}

export function FloatingButtons({ className }: FloatingButtonsProps) {
  const { mode, setMode, cardViewMode, setCardViewMode } = useMarketUI();

  const pill =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-xl select-none " +
    "transition duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 " +
    "active:scale-[.98]";

  const on =
    "bg-brand-500 text-slate-900 border border-brand-300 hover:bg-brand-600 active:bg-brand-700";

  const off =
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 active:bg-slate-200";

  return (
    <div
      className={`bottom-safe fixed z-50 hidden flex-col items-center gap-2 md:flex ${className ?? ""} `}
      style={{
        right:
          "max(1rem, calc((100vw - var(--page-max)) / 2 + var(--page-gutter)))",
      }}
      aria-label="Floating actions"
    >
      {/* Card View Mode Buttons */}
      <div className="flex gap-2" aria-label="Card view modes">
        <button
          type="button"
          aria-label="Image only view"
          aria-pressed={cardViewMode === "image-only"}
          onClick={() => setCardViewMode(cardViewMode === "image-only" ? "default" : "image-only")}
          className={cn(pill, cardViewMode === "image-only" ? on : off)}
        >
          <Square className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>Images</span>
        </button>
        <button
          type="button"
          aria-label="Full description view"
          aria-pressed={cardViewMode === "full-description"}
          onClick={() => setCardViewMode(cardViewMode === "full-description" ? "default" : "full-description")}
          className={cn(pill, cardViewMode === "full-description" ? on : off)}
        >
          <FileText className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>Full</span>
        </button>
      </div>

      {/* Content Mode Buttons */}
      <div className="flex gap-2" aria-label="Content modes">
        <button
          type="button"
          aria-label="Gallery"
          aria-pressed={mode === "gallery"}
          data-state={mode === "gallery" ? "on" : "off"}
          onClick={() => setMode(mode === "gallery" ? "browse" : "gallery")}
          className={cn(pill, mode === "gallery" ? on : off)}
        >
          <Images className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>Gallery</span>
        </button>

        <button
          type="button"
          aria-label="Saved"
          aria-pressed={mode === "saved"}
          data-state={mode === "saved" ? "on" : "off"}
          onClick={() => setMode(mode === "saved" ? "browse" : "saved")}
          className={cn(pill, mode === "saved" ? on : off)}
        >
          <Bookmark className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>Saved</span>
        </button>
      </div>
    </div>
  );
}
