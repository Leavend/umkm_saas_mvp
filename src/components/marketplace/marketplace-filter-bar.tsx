"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "~/lib/utils";
import { useMarketUI } from "~/stores/use-market-ui";
import { useTranslations } from "~/components/language-provider";
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
  const { isSearchOpen, closeSearch, toggleSearch } = useMarketUI();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const translations = useTranslations();

  // Enhanced focus management with proper timing
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      // Use requestAnimationFrame for better timing
      const focusTimer = requestAnimationFrame(() => {
        inputRef.current?.focus();
        // Scroll search into view if needed
        inputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });

      return () => cancelAnimationFrame(focusTimer);
    }
  }, [isSearchOpen]);

  // Enhanced keyboard handling with better mobile support
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      }
      // Handle Cmd/Ctrl + K for search toggle
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        toggleSearch();
      }
    },
    [closeSearch, toggleSearch],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle click outside to close search
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        closeSearch();
      }
    },
    [closeSearch],
  );

  useEffect(() => {
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, handleClickOutside]);

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
        "sticky z-40 bg-white/60 backdrop-blur transition-all duration-300 ease-in-out supports-[backdrop-filter]:bg-white/30",
        "md:border-b",
        isSearchOpen
          ? "border-b shadow-sm md:shadow-none"
          : "border-transparent",
        isSearchOpen && "xs:translate-x-1 sm:translate-x-2 md:translate-x-0",
        // Add gap for desktop, direct attachment for mobile
        "top-[var(--site-header-h,64px)] md:top-[calc(var(--site-header-h,64px)+0.75rem)]",
      )}
    >
      <div
        className={cn(
          "mx-auto w-full transition-all duration-300 ease-in-out",
          isSearchOpen &&
            "xs:-translate-x-6 sm:-translate-x-8 md:translate-x-0",
        )}
        style={{
          maxWidth: "var(--page-max)",
          paddingLeft: "var(--page-gutter)",
          paddingRight: "var(--page-gutter)",
        }}
      >
        {/* Mobile: collapsible search with improved animation */}
        <div
          ref={searchContainerRef}
          id="mobile-searchbar"
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out md:hidden",
            isSearchOpen
              ? "max-h-96 translate-y-0 opacity-100"
              : "max-h-0 -translate-y-2 opacity-0",
          )}
          aria-hidden={!isSearchOpen}
        >
          <div
            className={cn(
              "py-3 transition-all duration-300",
              isSearchOpen ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="mb-2">
              <MarketplaceSearch
                ref={inputRef}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                placeholder={translations.marketplace.searchPlaceholder}
              />
            </div>
            <div className="animate-in slide-in-from-top-2 duration-300">
              <CategoryChips
                selectedCategories={selectedCategories}
                onCategoriesChange={onCategoriesChange}
              />
            </div>
          </div>
        </div>

        {/* Desktop: persistent search */}
        <div className="hidden py-3 md:block">
          <MarketplaceSearch
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            placeholder="Search prompts..."
          />
          <div className="mt-2">
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
