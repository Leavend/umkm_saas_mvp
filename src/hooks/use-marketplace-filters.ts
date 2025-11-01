// src/hooks/use-marketplace-filters.ts

import { useState, useMemo } from "react";
import type { Prompt } from "@prisma/client";
import type { MarketplaceFilters, ViewMode } from "~/lib/types";

/**
 * Custom hook for managing marketplace filters and search
 */
export function useMarketplaceFilters(prompts: Prompt[]) {
  const [filters, setFilters] = useState<MarketplaceFilters>({
    searchQuery: "",
    selectedCategory: "all",
    viewMode: "gallery",
  });

  // Get unique categories from prompts
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(prompts.map((p) => p.category)))],
    [prompts],
  );

  // Filter prompts based on current filters
  const filteredPrompts = useMemo(() => {
    let filtered =
      filters.selectedCategory === "all" || filters.selectedCategory === ""
        ? prompts
        : prompts.filter((p) => p.category === filters.selectedCategory);

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.text.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [prompts, filters]);

  const setSearchQuery = (searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  };

  const setSelectedCategory = (selectedCategory: string) => {
    setFilters((prev) => ({ ...prev, selectedCategory }));
  };

  const setViewMode = (viewMode: ViewMode) => {
    setFilters((prev) => ({ ...prev, viewMode }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      selectedCategory: "all",
      viewMode: "gallery",
    });
  };

  return {
    filters,
    categories,
    filteredPrompts,
    setSearchQuery,
    setSelectedCategory,
    setViewMode,
    clearFilters,
  };
}
