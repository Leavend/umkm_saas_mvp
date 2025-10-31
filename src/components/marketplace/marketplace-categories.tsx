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
              ? "border-transparent bg-neutral-900 text-white shadow-[0_1px_2px_rgba(0,0,0,.04)]"
              : "border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,.04)]"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
