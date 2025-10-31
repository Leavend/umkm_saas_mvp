// src/stores/use-market-ui.ts

"use client";
import { create } from "zustand";

export type Mode = "browse" | "gallery" | "saved";
export type ViewMode = "grid" | "list";

export type MarketUI = {
  mode: Mode;
  view: ViewMode;
  setMode: (m: Mode) => void;
  setView: (v: ViewMode) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  closeSearch: () => void;
};

export const useMarketUI = create<MarketUI>((set) => ({
  mode: "browse",
  view: "grid",
  setMode: (mode) => set({ mode }),
  setView: (view) => set({ view }),
  isSearchOpen: false,
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  closeSearch: () => set({ isSearchOpen: false }),
}));
