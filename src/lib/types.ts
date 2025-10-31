// src/lib/types.ts

/**
 * Shared type definitions across the application
 */

import type { Prompt } from "@prisma/client";

/**
 * Modal types used throughout the app
 */
export type ModalType = "auth" | "topup" | "settings" | null;

/**
 * View modes for marketplace/gallery
 */
export type ViewMode = "gallery" | "saved" | null;

/**
 * Product configuration type
 */
export interface ProductConfig {
  id: string;
  credits: number;
  amount: number;
  usdAmount: number;
  name: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

/**
 * Filter state for marketplace
 */
export interface MarketplaceFilters {
  searchQuery: string;
  selectedCategory: string;
  viewMode: ViewMode;
}

/**
 * Component props interfaces
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PromptCardProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
}

export interface MarketplacePageProps {
  prompts?: Prompt[];
  lang: string;
}

/**
 * Hook return types
 */
export interface UseCreditsReturn {
  credits: number | null;
  isLoading: boolean;
  refreshCredits: () => Promise<void>;
}

export interface UseFiltersReturn {
  filters: MarketplaceFilters;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setViewMode: (mode: ViewMode) => void;
  clearFilters: () => void;
}
