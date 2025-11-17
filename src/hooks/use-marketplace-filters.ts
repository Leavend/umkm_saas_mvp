import { useState, useMemo, useCallback } from "react";
import type { Prompt } from "@prisma/client";
import type { MarketplaceFilters, ViewMode } from "~/lib/types";
import { BUSINESS_CONSTANTS } from "~/lib/constants/business";
import { isValidStringLength } from "~/lib/utils";

/**
 * Extract filter logic into a separate function for better testing and reusability
 */
function filterPrompts(
  prompts: Prompt[],
  filters: MarketplaceFilters,
): Prompt[] {
  let filtered = prompts;

  // Category filter
  if (
    filters.selectedCategory &&
    filters.selectedCategory !== "all" &&
    filters.selectedCategory.trim() !== ""
  ) {
    filtered = filtered.filter(
      (prompt) =>
        prompt.category.toLowerCase() ===
        filters.selectedCategory.toLowerCase(),
    );
  }

  // Search filter with validation
  if (
    filters.searchQuery &&
    filters.searchQuery.trim().length >=
      BUSINESS_CONSTANTS.content.searchMinLength
  ) {
    const query = filters.searchQuery.toLowerCase().trim();

    filtered = filtered.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.text.toLowerCase().includes(query) ||
        prompt.category.toLowerCase().includes(query),
    );
  }

  return filtered;
}

/**
 * Extract category extraction logic
 */
function extractCategories(prompts: Prompt[]): string[] {
  const categories = Array.from(
    new Set(prompts.map((prompt) => prompt.category)),
  );
  return ["all", ...categories.sort()];
}

/**
 * Validate filter inputs
 */
function validateSearchQuery(query: string): boolean {
  if (!query) return true; // Empty query is valid

  return isValidStringLength(
    query,
    BUSINESS_CONSTANTS.content.searchMinLength,
    BUSINESS_CONSTANTS.content.searchMaxLength,
  );
}

function validateCategory(category: string): boolean {
  if (!category) return false;
  return isValidStringLength(
    category,
    1,
    BUSINESS_CONSTANTS.content.maxCategoryLength,
  );
}

/**
 * Custom hook for managing marketplace filters and search functionality
 * Provides efficient filtering with memoization for performance
 * with improved validation and error handling
 *
 * @param prompts - Array of prompts to filter
 * @returns Filter state, categories, filtered prompts, and filter actions
 */
export function useMarketplaceFilters(prompts: Prompt[]) {
  const [filters, setFilters] = useState<MarketplaceFilters>({
    searchQuery: "",
    selectedCategory: "all",
    viewMode: "gallery",
  });

  // Memoize categories to prevent unnecessary recalculation
  const categories = useMemo(() => extractCategories(prompts), [prompts]);

  // Memoize filtered prompts with comprehensive filtering logic
  const filteredPrompts = useMemo(
    () => filterPrompts(prompts, filters),
    [prompts, filters],
  );

  // Memoize search function to prevent unnecessary re-renders
  const setSearchQuery = useCallback((searchQuery: string) => {
    if (!validateSearchQuery(searchQuery)) {
      console.warn("Invalid search query length");
      return;
    }

    setFilters((prev) => ({
      ...prev,
      searchQuery: searchQuery.trim(),
    }));
  }, []);

  // Memoize category filter function
  const setSelectedCategory = useCallback((selectedCategory: string) => {
    if (!validateCategory(selectedCategory)) {
      console.warn("Invalid category selected");
      return;
    }

    setFilters((prev) => ({
      ...prev,
      selectedCategory,
    }));
  }, []);

  // Memoize view mode function
  const setViewMode = useCallback((viewMode: ViewMode) => {
    setFilters((prev) => ({
      ...prev,
      viewMode,
    }));
  }, []);

  // Memoize clear filters function
  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: "",
      selectedCategory: "all",
      viewMode: "gallery",
    });
  }, []);

  // Memoize result object to prevent unnecessary re-renders
  const result = useMemo(
    () => ({
      filters,
      categories,
      filteredPrompts,
      setSearchQuery,
      setSelectedCategory,
      setViewMode,
      clearFilters,
    }),
    [
      filters,
      categories,
      filteredPrompts,
      setSearchQuery,
      setSelectedCategory,
      setViewMode,
      clearFilters,
    ],
  );

  return result;
}
