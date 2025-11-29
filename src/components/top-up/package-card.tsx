// Package card component for credit packages

import { Coins, Check } from "lucide-react";
import { cn, formatCurrency } from "~/lib/utils";
import { PaymentButton } from "./payment-button";
import type { Product } from "./types";

interface PackageCardProps {
  product: Product;
  packageName: string;
  isProcessing: boolean;
  totalTokensLabel: string;
  saveLabel: string;
  badgeBestValueLabel: string;
  badgePopularLabel: string;
  purchaseCta: string;
  processingText: string;
  onPurchase: (productId: string) => void;
}

export function PackageCard({
  product,
  packageName,
  isProcessing,
  totalTokensLabel,
  saveLabel,
  badgeBestValueLabel,
  badgePopularLabel,
  purchaseCta,
  processingText,
  onPurchase,
}: PackageCardProps) {
  const badgeVariant =
    "badgeVariant" in product ? product.badgeVariant : undefined;
  const isPopular = badgeVariant === "popular";
  const isBestValue = badgeVariant === "best-value";

  return (
    <div
      data-testid="credit-package"
      data-package-id={product.id}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-gray-200 p-4 transition-all duration-300",
        "hover:border-gray-300 hover:shadow-lg",
        isBestValue
          ? "bg-gradient-to-br from-amber-50/50 to-orange-50/50"
          : isPopular
            ? "bg-gradient-to-br from-emerald-50/50 to-green-50/50"
            : "bg-white",
      )}
    >
      {/* Badge */}
      {(isBestValue || isPopular) && (
        <div className="absolute top-2 -right-6 rotate-45 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-0.5 text-[9px] font-bold text-white shadow-sm">
          {isBestValue ? badgeBestValueLabel : badgePopularLabel}
        </div>
      )}

      {/* Content */}
      <div className="space-y-2 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className={cn(
              "rounded-lg p-2",
              isBestValue && "bg-amber-100",
              isPopular && "bg-emerald-100",
              !isBestValue && !isPopular && "bg-slate-100",
            )}
          >
            <Coins
              className={cn(
                "h-5 w-5",
                isBestValue && "text-amber-600",
                isPopular && "text-emerald-600",
                !isBestValue && !isPopular && "text-slate-600",
              )}
            />
          </div>
        </div>

        {/* Package Name */}
        <h3 className="text-sm font-bold text-slate-900">{packageName}</h3>

        {/* Credits - Prominent */}
        <div>
          <div className="text-3xl font-black text-slate-900">
            {product.totalCredits}
          </div>
          <div className="text-[10px] font-medium text-slate-500">
            {totalTokensLabel}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-0.5">
          {/* Original Price - Strikethrough on Top */}
          <div className="text-center">
            <span className="text-[11px] text-slate-400 line-through">
              {formatCurrency(product.originalAmount)}
            </span>
          </div>
          {/* Actual Price - Below */}
          <div className="text-center">
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(product.amount)}
            </span>
          </div>
          {/* Savings Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              <Check className="h-2.5 w-2.5" />
              {saveLabel} {product.discount}%
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <PaymentButton
          productId={product.id}
          isProcessing={isProcessing}
          isBestValue={isBestValue}
          isPopular={isPopular}
          purchaseCta={purchaseCta}
          processingText={processingText}
          onPurchase={onPurchase}
        />
      </div>
    </div>
  );
}
