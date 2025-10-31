"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
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

  const toggleCategory = (category: string) => {
    if (category === "all") {
      // "all" category clears all selections
      onCategoriesChange([]);
      return;
    }

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

  const displayedCategories = isExpanded ? CATEGORIES : CATEGORIES.slice(0, 6);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">Categories</h3>
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="focus-visible:ring-brand-500/50 h-7 px-2 text-xs text-slate-500 hover:text-slate-700"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {displayedCategories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const isAllCategory = category === "all";

          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`focus-visible:ring-brand-500/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm capitalize transition-colors focus:outline-none focus-visible:ring-2 ${
                isSelected
                  ? "border-brand-300 bg-brand-500 text-slate-900"
                  : isAllCategory
                    ? "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {category}
              {isSelected && !isAllCategory && <X className="h-3 w-3" />}
            </button>
          );
        })}

        {!isExpanded && CATEGORIES.length > 6 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="focus-visible:ring-brand-500/50 h-7 px-2 text-xs text-slate-500 hover:text-slate-700"
          >
            +{CATEGORIES.length - 6} more
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
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-slate-500">Active:</span>
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="bg-brand-100 text-brand-800 text-xs"
            >
              {category}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
