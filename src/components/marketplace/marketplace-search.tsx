// src/components/marketplace/marketplace-search.tsx
import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface MarketplaceSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  showClearButton?: boolean;
  onClear?: () => void;
}

export const MarketplaceSearch = forwardRef<
  HTMLInputElement,
  MarketplaceSearchProps
>(
  (
    {
      searchQuery,
      onSearchChange,
      placeholder = "Search prompts...",
      showClearButton = true,
      onClear,
    },
    ref,
  ) => {
    const hasValue = searchQuery.trim().length > 0;

    const handleClear = () => {
      onSearchChange("");
      onClear?.();
      // Refocus input after clear
      if (ref && typeof ref === "object" && ref.current) {
        ref.current.focus();
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Optional: Add search submission logic here
    };

    return (
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-[16px] w-[16px] -translate-y-1/2 text-slate-400 sm:left-4 sm:h-[18px] sm:w-[18px]" />
        <Input
          ref={ref}
          type="search"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "h-10 w-full rounded-xl border-neutral-200 pr-3 pl-9 text-sm shadow-sm sm:h-11 sm:pr-4 sm:pl-10",
            "focus-visible:ring-brand-500/50 focus-visible:ring-2",
            "placeholder:text-slate-400",
            hasValue && "pr-10 sm:pr-12",
          )}
          autoComplete="off"
          enterKeyHint="search"
        />
        {showClearButton && hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="focus-visible:ring-brand-500/50 absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 rounded-full hover:bg-slate-100 focus-visible:ring-2 sm:right-3 sm:h-7 sm:w-7"
            aria-label="Clear search"
          >
            <X className="h-3 w-3 text-slate-400 sm:h-4 sm:w-4" />
          </Button>
        )}
      </form>
    );
  },
);
MarketplaceSearch.displayName = "MarketplaceSearch";
