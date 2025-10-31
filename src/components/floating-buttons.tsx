// src/components/floating-buttons.tsx

"use client";

import { Images, Bookmark } from "lucide-react";
import { cn } from "~/lib/utils";
import { useMarketUI } from "~/stores/use-market-ui";

interface FloatingButtonsProps {
  className?: string;
}

export function FloatingButtons({ className }: FloatingButtonsProps) {
  const { mode, setMode } = useMarketUI();

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
      className={`
        fixed z-50
        bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+1rem))]
        hidden md:flex items-center gap-2
        ${className ?? ""}
      `}
      style={{
        right: "max(1rem, calc((100vw - var(--container-max)) / 2 + var(--container-gutter)))",
      }}
      aria-label="Floating actions"
    >
      <button
        type="button"
        aria-label="Gallery"
        aria-pressed={mode === "gallery"}
        data-state={mode === "gallery" ? "on" : "off"}
        onClick={() => setMode(mode === "gallery" ? "browse" : "gallery")}
        className={cn(pill, mode === "gallery" ? on : off)}
      >
        <Images className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
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
        <Bookmark className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <span>Saved</span>
      </button>
    </div>
  );
}
