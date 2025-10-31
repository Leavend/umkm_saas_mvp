"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CATEGORIES } from "~/lib/placeholder-data";

interface CategoryChipsProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  className?: string;
}

export function CategoryChips({
  selectedCategories,
  onCategoriesChange,
  className,
}: CategoryChipsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out "all" category
  const realCategories = CATEGORIES.filter((c) => c !== "all");

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      // Remove category
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      // Add category
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const clearAll = () => {
    onCategoriesChange([]);
  };

  const displayedCategories = isExpanded ? realCategories : realCategories.slice(0, 6);

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {displayedCategories.map((category) => {
          const isSelected = selectedCategories.includes(category);

          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${
                isSelected
                  ? "bg-brand-500 text-slate-900 border-brand-300"
                  : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {category}
              {isSelected && <X className="h-3 w-3 ml-1" />}
            </button>
          );
        })}

        {!isExpanded && realCategories.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="focus-visible:ring-brand-500/50 h-7 px-2 text-xs text-slate-500 hover:text-slate-700"
          >
            +{realCategories.length - 6} more
          </Button>
        )}

        {isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="focus-visible:ring-brand-500/50 h-7 px-2 text-xs text-slate-500 hover:text-slate-700"
          >
            Show less
          </Button>
        )}

        {selectedCategories.length > 0 && (
          <button
            onClick={clearAll}
            className="ml-auto inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-500/50 focus:outline-none transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
