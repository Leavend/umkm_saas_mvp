// Package list component displaying grid of packages

import { PackageCard } from "./package-card";
import type { Product, TopUpTranslations } from "./types";

interface PackageListProps {
  products: Product[];
  packageNames: Record<string, string>;
  isProcessingId: string | null;
  translations: TopUpTranslations;
  onPurchase: (productId: string) => void;
}

export function PackageList({
  products,
  packageNames,
  isProcessingId,
  translations,
  onPurchase,
}: PackageListProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {products.map((product) => (
        <PackageCard
          key={product.id}
          product={product}
          packageName={packageNames[product.id] || product.name}
          isProcessing={isProcessingId === product.id}
          totalTokensLabel={translations.totalTokens}
          saveLabel={translations.save}
          badgeBestValueLabel={translations.badgeBestValueLabel}
          badgePopularLabel={translations.badgePopularLabel}
          purchaseCta={translations.purchaseCta}
          processingText={translations.processing}
          onPurchase={onPurchase}
        />
      ))}
    </div>
  );
}
