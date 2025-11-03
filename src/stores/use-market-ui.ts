// src/stores/use-market-ui.ts

"use client";
import { create } from "zustand";

export type Mode = "browse" | "gallery" | "saved" | null;
export type ViewMode = "grid" | "list";
export type MobileViewMode = "default" | "photo-only";
export type CardViewMode = "default" | "image-only" | "full-description";

export type MarketUI = {
  mode: Mode;
  view: ViewMode;
  mobileViewMode: MobileViewMode;
  cardViewMode: CardViewMode;
  setMode: (m: Mode) => void;
  setView: (v: ViewMode) => void;
  setMobileViewMode: (m: MobileViewMode) => void;
  setCardViewMode: (c: CardViewMode) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  closeSearch: () => void;
};

export const useMarketUI = create<MarketUI>((set) => ({
  mode: "browse",
  view: "grid",
  mobileViewMode: "default",
  cardViewMode: "default",
  setMode: (mode) => set({ mode }),
  setView: (view) => set({ view }),
  setMobileViewMode: (mobileViewMode) => set({ mobileViewMode }),
  setCardViewMode: (cardViewMode) => set({ cardViewMode }),
  isSearchOpen: false,
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  closeSearch: () => set({ isSearchOpen: false }),
}));
