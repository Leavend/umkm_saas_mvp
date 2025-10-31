// src/components/marketplace/marketplace-search.tsx

import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";

interface MarketplaceSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MarketplaceSearch({
  searchQuery,
  onSearchChange,
}: MarketplaceSearchProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative mx-auto w-[560px] max-w-full">
        <Search className="absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 rounded-xl border-neutral-200 pl-10 shadow-sm"
        />
      </div>
    </div>
  );
}
