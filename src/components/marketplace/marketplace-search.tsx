// src/components/marketplace/marketplace-search.tsx
import { forwardRef } from "react";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";

interface MarketplaceSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const MarketplaceSearch = forwardRef<
  HTMLInputElement,
  MarketplaceSearchProps
>(({ searchQuery, onSearchChange }, ref) => {
  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
      <Input
        ref={ref}
        type="text"
        placeholder="Search prompts..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-11 w-full rounded-xl border-neutral-200 pl-10 shadow-sm"
      />
    </div>
  );
});
MarketplaceSearch.displayName = "MarketplaceSearch";
