// src/components/sticky-actions-rail.tsx
"use client";

import { Images, Bookmark } from "lucide-react";
import { useMarketUI } from "~/stores/use-market-ui";
import { cn } from "~/lib/utils";
import { useTranslations } from "~/components/language-provider";

interface StickyActionsRailProps {
  onGalleryClick?: () => void;
  onSavedClick?: () => void;
}

export function StickyActionsRail({
  onGalleryClick,
  onSavedClick,
}: StickyActionsRailProps) {
  const { mode, setMode } = useMarketUI();
  const translations = useTranslations();

  // Safe accessor for marketplace translations with fallback
  const getMarketplaceLabel = (key: "galleryTitle" | "savedTitle"): string => {
    return (
      translations?.marketplace?.[key] ??
      (key === "galleryTitle" ? "Gallery" : "Saved")
    );
  };

  const toggleMode = (nextMode: "gallery" | "saved") => {
    // If clicking the same mode, turn it off (set to null)
    // Otherwise, set to the new mode
    const newMode = mode === nextMode ? null : nextMode;
    setMode(newMode);

    if (newMode === "gallery") {
      onGalleryClick?.();
    } else if (newMode === "saved") {
      onSavedClick?.();
    }
  };

  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const inactiveClasses =
    "bg-white text-slate-800 border-slate-200 hover:bg-slate-50";
  const activeClasses =
    "bg-[var(--brand-600)] text-white border-[var(--brand-600)] hover:bg-[var(--brand-600)] focus-visible:ring-[var(--brand-600)]";

  return (
    <div
      role="region"
      aria-label="Quick actions"
      className={cn(
        "pointer-events-none sticky bottom-[max(16px,env(safe-area-inset-bottom)+12px)] z-40 justify-end",
        "hidden md:flex",
      )}
      style={{
        maxWidth: "var(--page-max)",
        paddingLeft: "var(--page-gutter)",
        paddingRight: "var(--page-gutter)",
      }}
    >
      <div className="pointer-events-auto flex gap-2 sm:gap-3">
        {/* Gallery Button */}
        <button
          type="button"
          onClick={() => toggleMode("gallery")}
          className={`${baseClasses} ${mode === "gallery" ? activeClasses : inactiveClasses}`}
          aria-label={getMarketplaceLabel("galleryTitle")}
          aria-pressed={mode === "gallery"}
        >
          <Images className="h-4 w-4" />
          <span className="hidden sm:inline">
            {getMarketplaceLabel("galleryTitle")}
          </span>
        </button>

        {/* Saved Button */}
        <button
          type="button"
          onClick={() => toggleMode("saved")}
          className={`${baseClasses} ${mode === "saved" ? activeClasses : inactiveClasses}`}
          aria-label={getMarketplaceLabel("savedTitle")}
          aria-pressed={mode === "saved"}
        >
          <Bookmark className="h-4 w-4" />
          <span className="hidden sm:inline">
            {getMarketplaceLabel("savedTitle")}
          </span>
        </button>
      </div>
    </div>
  );
}
