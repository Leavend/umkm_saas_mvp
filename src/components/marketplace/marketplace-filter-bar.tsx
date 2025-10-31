"use client";

import { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";
import { useMarketUI } from "~/stores/use-market-ui";
import { MarketplaceSearch } from "./marketplace-search";
import { CategoryChips } from "~/components/category-chips";

interface MarketplaceFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  lastUpdated: Date;
}

export function MarketplaceFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoriesChange,
}: MarketplaceFilterBarProps) {
  const { isSearchOpen, closeSearch } = useMarketUI();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isSearchOpen]);

  // Add Esc to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch]);

  // Set header height CSS variable on mount
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (header) {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty(
        "--site-header-h",
        `${height}px`,
      );
    }
  }, []);

  return (
    <section
      id="filter-bar"
      className={cn(
        "sticky top-[var(--site-header-h,64px)] z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        "md:border-b",
        isSearchOpen ? "border-b" : "border-transparent",
      )}
    >
      <div className="mx-auto w-full max-w-[1100px] px-5 md:px-6 lg:px-8">
        {/* Mobile: collapsible search */}
        <div
          id="mobile-searchbar"
          className="grid overflow-hidden transition-all duration-200 ease-out md:hidden [grid-template-rows:0fr] data-[open=true]:[grid-template-rows:1fr]"
          data-open={isSearchOpen}
        >
          <div className="min-h-0 py-3">
            <MarketplaceSearch
              ref={inputRef}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
            <div className="mt-3">
              <CategoryChips
                selectedCategories={selectedCategories}
                onCategoriesChange={onCategoriesChange}
              />
            </div>
          </div>
        </div>

        {/* Desktop: persistent search */}
        <div className="hidden py-4 md:block">
          <MarketplaceSearch
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
          <div className="mt-3">
            <CategoryChips
              selectedCategories={selectedCategories}
              onCategoriesChange={onCategoriesChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
