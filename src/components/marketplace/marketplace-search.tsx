// src/components/marketplace/marketplace-search.tsx
import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "~/lib/utils";

interface MarketplaceSearchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
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
      className,
      ...props
    },
    ref,
  ) => {
    const hasValue = searchQuery.length > 0;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
    };

    return (
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-[16px] w-[16px] -translate-y-1/2 text-slate-400 sm:left-4 sm:h-[18px] sm:w-[18px]" />
        <input
          ref={ref}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          type="search"
          placeholder={placeholder}
          className={cn(
            "focus-visible:ring-brand-500/50 w-full rounded-full border border-slate-200 py-2 pr-8 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5 sm:pr-10 sm:pl-10",
            "placeholder:text-slate-400",
            hasValue && "pr-10 sm:pr-12",
            className,
          )}
          autoComplete="off"
          enterKeyHint="search"
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="focus-visible:ring-brand-500/50 absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 rounded-full hover:bg-slate-100 focus-visible:ring-2 sm:right-3 sm:h-7 sm:w-7"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>
    );
  },
);

MarketplaceSearch.displayName = "MarketplaceSearch";
