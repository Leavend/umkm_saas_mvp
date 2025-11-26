// src/components/top-up-modal.tsx

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useTranslations } from "~/components/language-provider";
import { formatTranslation } from "~/lib/i18n";
import { PRODUCT_CONFIG } from "~/lib/constants";
import { toast } from "sonner";
import { Loader2, Coins, Check, X } from "lucide-react";
import { cn, formatCurrency } from "~/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useCredits } from "~/hooks/use-credits";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  onCreditsUpdate?: (newCredits: number) => void;
}

// Helper functions
const calculateDiscountPercentage = (
  original: number,
  current: number,
): number => Math.round(((original - current) / original) * 100);

// Product configuration
const createProductConfig = (
  baseProduct:
    | typeof PRODUCT_CONFIG.SMALL
    | typeof PRODUCT_CONFIG.MEDIUM
    | typeof PRODUCT_CONFIG.LARGE,
  originalAmount: number,
) => ({
  ...baseProduct,
  originalAmount,
  amount: baseProduct.amount,
  discount: calculateDiscountPercentage(originalAmount, baseProduct.amount),
  totalCredits: baseProduct.credits + baseProduct.bonusCredits,
});

export function TopUpModal({
  isOpen,
  onClose,
  lang: _lang,
  onCreditsUpdate: _onCreditsUpdate,
}: TopUpModalProps) {
  const translations = useTranslations();
  const t = translations.dashboard.topUp;
  const tCommon = translations.common.actions;

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Get user session and credits
  const { data: session } = useSession();
  const { credits } = useCredits();
  const user = session?.user;

  // Package name mapping for i18n
  const packageNames: Record<string, string> = {
    [PRODUCT_CONFIG.SMALL.id]: t.packages.starterPack,
    [PRODUCT_CONFIG.MEDIUM.id]: t.packages.growthPack,
    [PRODUCT_CONFIG.LARGE.id]: t.packages.proPack,
  };

  // Product configuration
  const products = [
    createProductConfig(PRODUCT_CONFIG.SMALL, 29000),
    createProductConfig(PRODUCT_CONFIG.MEDIUM, 49000),
    createProductConfig(PRODUCT_CONFIG.LARGE, 99000),
  ];

  const handlePurchase = async (productId: string): Promise<void> => {
    setIsProcessing(productId);
    try {
      const response = await fetch("/api/xendit/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          currency: "IDR",
        }),
      });

      const data = (await response.json()) as {
        invoiceUrl?: string;
        error?: string;
      };

      if (response.ok && data.invoiceUrl) {
        // Open Xendit invoice in new tab
        window.open(data.invoiceUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error(data.error ?? t.paymentFailed);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(t.paymentProcessFailed);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-xl border-0 bg-white p-0 shadow-2xl",
        )}
      >
        <DialogTitle className="sr-only">{t.title}</DialogTitle>

        {/* Compact Header */}
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-slate-50 to-blue-50/30 px-4 py-3">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">
              {user
                ? formatTranslation(t.header, { name: user.name ?? "User" })
                : t.fallbackTitle}
            </h1>
            <div className="mt-0.5 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="rounded-md bg-gradient-to-br from-amber-400 to-amber-500 p-1">
                  <Coins className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  <span className="text-slate-500">{t.tokenLabel}</span>{" "}
                  {credits ?? 0}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={!!isProcessing}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
            aria-label={tCommon.close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Compact Product Grid */}
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {products.map((product) => {
              const badgeVariant =
                "badgeVariant" in product ? product.badgeVariant : undefined;
              const isPopular = badgeVariant === "popular";
              const isBestValue = badgeVariant === "best-value";

              return (
                <div
                  key={product.id}
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
                      {isBestValue
                        ? t.badgeBestValueLabel
                        : t.badgePopularLabel}
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
                    <h3 className="text-sm font-bold text-slate-900">
                      {packageNames[product.id] || product.name}
                    </h3>

                    {/* Credits - Prominent */}
                    <div>
                      <div className="text-3xl font-black text-slate-900">
                        {product.totalCredits}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500">
                        {t.totalTokens}
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
                          {t.save} {product.discount}%
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handlePurchase(product.id)}
                      disabled={!!isProcessing}
                      className={cn(
                        "w-full rounded-lg py-2.5 text-sm font-bold shadow-sm transition-all hover:shadow-md active:scale-[0.98]",
                        isBestValue &&
                          "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700",
                        isPopular &&
                          "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700",
                        !isBestValue &&
                          !isPopular &&
                          "bg-slate-900 text-white hover:bg-slate-800",
                      )}
                    >
                      {isProcessing === product.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>{t.processing}</span>
                        </div>
                      ) : (
                        <span>{t.purchaseCta}</span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Footer */}
          <div className="mt-3 flex items-center justify-between border-t pt-2.5">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-0.5">
                <Check className="h-3 w-3 text-emerald-500" />
                <span>{t.instant}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Check className="h-3 w-3 text-emerald-500" />
                <span>{t.bonus}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Check className="h-3 w-3 text-emerald-500" />
                <span>{t.safe}</span>
              </div>
            </div>

            <Button
              onClick={async () => {
                try {
                  await signOut({ redirect: false });
                  toast.success(t.logoutSuccess);
                  onClose();
                } catch (error) {
                  console.error("Logout error:", error);
                  toast.error(t.logoutFailed);
                }
              }}
              variant="ghost"
              className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900"
            >
              {t.logout}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
