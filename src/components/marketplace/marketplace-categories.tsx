// src/components/marketplace/marketplace-categories.tsx

interface MarketplaceCategoriesProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function MarketplaceCategories({
  categories,
  selectedCategory,
  onCategoryChange,
}: MarketplaceCategoriesProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`h-9 rounded-full border px-3 text-sm whitespace-nowrap capitalize transition-colors ${
            selectedCategory === category
              ? "border-brand-300 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,.04)]"
              : "border-slate-200 bg-slate-100 text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,.04)] hover:bg-slate-200 active:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
