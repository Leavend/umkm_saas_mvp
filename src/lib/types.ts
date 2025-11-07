// src/lib/types.ts

/**
 * Shared type definitions across the application
 */

import type { Prompt } from "@prisma/client";

// ===== CORE TYPES =====

/**
 * Standard API response wrapper for consistent error handling
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | ErrorDetails;
  message?: string;
}

/**
 * Detailed error information
 */
export interface ErrorDetails {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * User interface from auth session
 */
export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

// ===== UI TYPES =====

/**
 * Modal types used throughout the app
 */
export type ModalType = "auth" | "topup" | null;

/**
 * View modes for marketplace/gallery
 */
export type ViewMode = "gallery" | "saved" | null;

/**
 * Loading states for better UX
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

// ===== BUSINESS LOGIC TYPES =====

/**
 * Product configuration type
 */
export interface ProductConfig {
  readonly id: string;
  readonly credits: number;
  readonly amount: number;
  readonly usdAmount: number;
  readonly name: string;
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

// ===== COMPONENT PROP TYPES =====

/**
 * Base props for all components
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Props for prompt-related components
 */
export interface PromptCardProps extends BaseComponentProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
}

export interface MarketplacePageProps {
  prompts?: Prompt[];
  lang: string;
}

// ===== HOOK RETURN TYPES =====

/**
 * Credits management hook return type
 */
export interface UseCreditsReturn {
  credits: number | null;
  isLoading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
}

/**
 * Auth session hook return type
 */
export interface UseAuthSessionReturn {
  user: User | null;
  isAuthenticated: boolean;
  isPending: boolean;
  error: string | null;
}

/**
 * Marketplace filters hook return type
 */
export interface UseFiltersReturn {
  filters: MarketplaceFilters;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setViewMode: (mode: ViewMode) => void;
  clearFilters: () => void;
}

/**
 * Google auth hook options
 */
export interface UseGoogleAuthOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectPath?: string;
}

/**
 * Google auth hook return type
 */
export interface UseGoogleAuthReturn {
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
}
