// src/components/category-chips.tsx

"use client";

import { useEffect, useRef } from "react";
// import { X } from "lucide-react";
import { CATEGORIES } from "~/lib/placeholder-data";

interface CategoryChipsProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  className?: string;
}

export function CategoryChips({
  selectedCategories,
  onCategoriesChange,
  className,
}: CategoryChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChipRef = useRef<HTMLButtonElement>(null);

  // Filter out "all"
  const realCategories = CATEGORIES.filter((c) => c !== "all");

  // Only single select
  const selectedCategory =
    selectedCategories.length > 0 ? selectedCategories[0] : null;

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) onCategoriesChange([]);
    else onCategoriesChange([category]);
  };

  const clearAll = () => onCategoriesChange([]);

  // Scroll active chip into view (center-ish)
  useEffect(() => {
    const container = containerRef.current;
    const activeChip = activeChipRef.current;
    if (!container || !activeChip) return;

    const containerWidth = container.clientWidth;
    const activeLeft = activeChip.offsetLeft;
    const activeWidth = activeChip.clientWidth;

    const newScrollLeft = activeLeft - containerWidth / 2 + activeWidth / 2;
    const maxScroll = container.scrollWidth - containerWidth;
    const clamped = Math.max(0, Math.min(newScrollLeft, maxScroll));

    container.scrollTo({ left: clamped, behavior: "smooth" });
  }, [selectedCategory]);

  return (
    <div className={className}>
      {/* Two columns: left = scrollable chips, right = fixed Clear */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* SCROLL CONTAINER: grows, never wraps */}
        <div
          ref={containerRef}
          role="tablist"
          aria-label="Categories"
          className="flex min-w-0 flex-1 snap-x snap-proximity flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain pb-1 whitespace-nowrap [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden"
        >
          {realCategories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                ref={isSelected ? activeChipRef : null}
                onClick={() => handleCategorySelect(category)}
                role="tab"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={`focus-visible:ring-brand-500/50 inline-flex flex-shrink-0 items-center rounded-full border px-2 py-1 text-xs capitalize transition-colors focus:outline-none focus-visible:ring-2 sm:px-3 sm:py-1.5 sm:text-sm ${
                  isSelected
                    ? "bg-brand-500 border-brand-300 text-slate-900"
                    : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
                } `}
              >
                {category}
                {/* Keep the small X inside active chip if you like; remove if not needed */}
                {/* {isSelected && <X className="ml-1 h-3 w-3" />} */}
              </button>
            );
          })}
        </div>

        {/* CLEAR: fixed at right, aligned to grid; not inside the scroller */}
        {selectedCategory && (
          <button
            onClick={clearAll}
            className="focus-visible:ring-brand-500/50 inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 sm:px-3 sm:py-1.5 sm:text-sm"
            aria-label="Clear selected category"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
