// src/components/floating-buttons.tsx

import { Grid3X3, Bookmark } from "lucide-react";
import React from "react";

type Mode = "gallery" | "saved" | null;

interface FloatingButtonsProps {
  onGalleryClick?: () => void;
  onSavedClick?: () => void;
  onModeChange?: (next: Mode) => void;
  onClearMode?: () => void;
  active?: Mode;
  className?: string;
  avoidFooterSelector?: string;
}

export function FloatingButtons({
  onGalleryClick,
  onSavedClick,
  onModeChange,
  onClearMode,
  active,
  className,
  avoidFooterSelector = "#site-footer",
}: FloatingButtonsProps) {
  const isControlled = active !== undefined;
  const [internal, setInternal] = React.useState<Mode>(null);
  const mode = isControlled ? active : internal;

  const setMode = (next: Mode) => {
    if (!isControlled) setInternal(next);
    onModeChange?.(next);
    if (next === null) onClearMode?.();
  };

  const handlePress = (target: Exclude<Mode, null>) => {
    const next = mode === target ? null : target;
    setMode(next);
    if (next === "gallery") onGalleryClick?.();
    if (next === "saved") onSavedClick?.();
  };

  // === Dorong FAB saat footer terlihat ===
  const [pushUp, setPushUp] = React.useState(false);
  React.useEffect(() => {
    const footer = document.querySelector(avoidFooterSelector);
    if (!footer) return;
    const io = new IntersectionObserver(
      ([entry]) => setPushUp(entry?.isIntersecting ?? false),
      { root: null, threshold: 0.01 },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, [avoidFooterSelector]);

  const baseBtn =
    "flex h-11 items-center gap-2 rounded-full border border-neutral-300 " +
    "bg-white px-5 text-sm font-semibold text-neutral-900 shadow-lg " +
    "transition-[transform,box-shadow,background-color,color] duration-150 " +
    "hover:scale-[1.03] hover:shadow-xl active:scale-95 " +
    "focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 " +
    "max-[360px]:size-12 max-[360px]:px-0 sm:h-10 sm:px-4 sm:text-xs " +
    "max-[360px]:[&>span]:sr-only " +
    "aria-[pressed=true]:bg-brand-500 aria-[pressed=true]:text-slate-900 aria-[pressed=true]:border-transparent";

  return (
    <div
      className={`align-with-container-right fixed z-50 flex items-center gap-3 ${
        pushUp ? "fab-push-up" : "bottom-safe"
      } ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={() => handlePress("gallery")}
        className={baseBtn}
        role="button"
        aria-label="Open gallery"
        aria-pressed={mode === "gallery"}
      >
        <Grid3X3 className="h-4 w-4 flex-shrink-0" />
        <span>Gallery</span>
      </button>

      <button
        type="button"
        onClick={() => handlePress("saved")}
        className={baseBtn}
        role="button"
        aria-label="Open saved"
        aria-pressed={mode === "saved"}
      >
        <Bookmark className="h-4 w-4 flex-shrink-0" />
        <span>Saved</span>
      </button>
    </div>
  );
}
