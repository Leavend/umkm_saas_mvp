// src/components/top-up-modal.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import { CompactModalHeader } from "~/components/ui/modal-header";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useTranslations } from "~/components/language-provider";
import { formatTranslation } from "~/lib/i18n";
import { PRODUCT_CONFIG } from "~/lib/constants";
import { toast } from "sonner";
import { Loader2, Coins, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { useSession } from "~/lib/auth-client";
import { useCredits } from "~/hooks/use-credits";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  onCreditsUpdate?: (newCredits: number) => void;
}

// Constants for better maintainability
const UI_CONSTANTS = {
  CURRENCY: "IDR" as const,
  ANIMATION_DURATION: "300ms",
  GRID_COLS: {
    mobile: 1,
    desktop: 3,
  },
} as const;

// Helper functions
const formatCurrency = (amount: number): string => 
  `Rp ${amount.toLocaleString("id-ID")}`;

const calculateDiscountPercentage = (original: number, current: number): number =>
  Math.round(((original - current) / original) * 100);

// Product configuration with UI enhancements
const createProductConfig = (
  baseProduct: typeof PRODUCT_CONFIG.SMALL | typeof PRODUCT_CONFIG.MEDIUM | typeof PRODUCT_CONFIG.LARGE,
  originalAmount: number
) => ({
  ...baseProduct,
  originalAmount,
  amount: baseProduct.amount,
  discount: calculateDiscountPercentage(originalAmount, baseProduct.amount),
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

  // Enhanced product configuration
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
          currency: UI_CONSTANTS.CURRENCY,
        }),
      });

      const data = (await response.json()) as {
        invoiceUrl?: string;
        error?: string;
      };

      if (response.ok && data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        toast.error(data.error ?? "Gagal membuat pembayaran");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Gagal memproses pembayaran");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      const { authClient } = await import("~/lib/auth-client");
      await authClient.signOut();
      toast.success("Logout berhasil");
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout gagal. Silakan coba lagi.");
    }
  };

  const renderBadge = (product: (typeof products)[number]) => {
    if (!('badge' in product) || !product.badge) return null;

    const badgeVariants = {
      popular: {
        className: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-sm",
      },
      'best-value': {
        className: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300 shadow-sm",
      },
    } as const;

    const variant = 'badgeVariant' in product ? product.badgeVariant : null;
    if (!variant || !(variant in badgeVariants)) return null;

    const badgeConfig = badgeVariants[variant];
    const discountText = product.badge.includes("Hemat") 
      ? formatTranslation(t.badgeSave, { percent: product.discount })
      : t.badgePopular;

    return (
      <Badge
        variant="outline"
        className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold transition-all hover:scale-105",
          badgeConfig.className,
        )}
      >
        {variant === 'best-value' ? t.badgeBestValue : discountText}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-0 shadow-2xl sm:mx-0">
        <DialogTitle className="sr-only">{t.title}</DialogTitle>

        {/* Premium Header with Gradient - Compact */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-6 py-5 border-b">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-24 h-24 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-32 h-32 bg-indigo-400 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <CompactModalHeader
              title={
                user
                  ? formatTranslation(t.header, { name: user.name ?? "User" })
                  : t.title
              }
              onClose={onClose}
              closeDisabled={!!isProcessing}
              closeButtonLabel={tCommon.close}
              className="mb-4 text-white [&_h1]:text-white"
            />

            {/* Current Balance Display - Compact */}
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-xl px-4 py-3 border border-white/20 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg shadow-lg">
                  <Coins className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-200">Saldo Tersedia</p>
                  <p className="text-2xl font-bold text-white">
                    {formatTranslation(t.balance, { count: credits ?? 0 })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-200 mb-1">Bonus Reguler</p>
                <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 text-xs font-semibold px-2 py-0.5">
                  +1 setiap hari
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Compact */}
        <div className="p-6 space-y-5">
          {/* Section Header - Compact */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                {t.title}
              </h2>
              <div className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
            </div>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* Product Cards Grid - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product, index) => {
              const badgeVariant = 'badgeVariant' in product ? product.badgeVariant : undefined;
              const isPopular = badgeVariant === "popular";
              const isBestValue = badgeVariant === "best-value";

              return (
                <div
                  key={product.id}
                  className={cn(
                    "relative group rounded-3xl overflow-hidden transition-all duration-300",
                    "hover:shadow-2xl hover:-translate-y-2",
                    isPopular
                      ? "ring-2 ring-green-500 bg-gradient-to-br from-white to-green-50 shadow-xl"
                      : isBestValue
                      ? "ring-2 ring-orange-500 bg-gradient-to-br from-white to-orange-50 shadow-xl transform md:scale-105"
                      : "border border-slate-200 bg-white shadow-lg hover:border-slate-300"
                  )}
                >
                  {/* Glow effect on hover */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    isPopular && "bg-green-500/5",
                    isBestValue && "bg-orange-500/5"
                  )}></div>

                  <div className="relative p-5 space-y-4">
                    {renderBadge(product)}

                    {/* Package Name */}
                    <div>
                      <p className={cn(
                        "text-xs font-semibold tracking-wider uppercase",
                        isPopular ? "text-green-600" : isBestValue ? "text-orange-600" : "text-slate-500"
                      )}>
                        {product.name}
                      </p>
                    </div>

                    {/* Pricing Section - Compact */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-slate-900">
                          {formatCurrency(product.amount).split('.')[0]}
                        </p>
                        <p className="text-xs text-slate-500 line-through">
                          {formatCurrency(product.originalAmount)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600">
                        Hemat {product.discount}%
                      </p>
                    </div>

                    {/* Credits - Simplified */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-3 py-2.5 border border-blue-100">
                      <span className="text-sm font-semibold text-slate-900">Total Kredit</span>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {product.credits + product.bonusCredits}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.credits} + {product.bonusCredits} bonus
                        </p>
                      </div>
                    </div>

                    {/* CTA Button - Compact */}
                    <Button
                      onClick={() => handlePurchase(product.id)}
                      disabled={isProcessing === product.id}
                      className={cn(
                        "w-full py-3 font-bold text-sm transition-all duration-200 rounded-xl",
                        "transform hover:scale-[1.02] active:scale-95",
                        isPopular
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-green-500/50"
                          : isBestValue
                          ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 shadow-lg hover:shadow-orange-500/50"
                          : "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg"
                      )}
                    >
                      {isProcessing === product.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Memproses...</span>
                        </div>
                      ) : (
                        <span>{t.purchaseCta}</span>
                      )}
                    </Button>

                    {/* Value Indicator - Compact */}
                    {isPopular || isBestValue ? (
                      <div className={cn(
                        "text-xs text-center font-semibold py-1.5 px-3 rounded-lg",
                        isPopular && "bg-green-100 text-green-700",
                        isBestValue && "bg-orange-100 text-orange-700"
                      )}>
                        {isPopular && "🌟 Pilihan Populer"}
                        {isBestValue && "🚀 Nilai Terbaik"}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Section - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-4 border-y border-slate-200">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-slate-900">Proses Instan</p>
              <p className="text-xs text-slate-600">Kredit langsung masuk</p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs font-semibold text-slate-900">Bonus Setiap Hari</p>
              <p className="text-xs text-slate-600">+1 kredit gratis tiap hari</p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-10 h-10 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-base font-bold text-purple-600">✓</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">Aman & Terpercaya</p>
              <p className="text-xs text-slate-600">Pembayaran tersertifikasi</p>
            </div>
          </div>

          {/* Terms and Security - Compact */}
          <div className="text-center space-y-2">
            <p
              className="text-xs text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: formatTranslation(t.terms, {
                  terms: `<a href="/terms" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold hover:text-blue-800 underline transition-colors">${t.termsLink}</a>`,
                })
              }}
            />
            <p className="text-xs text-slate-500">
              🔒 Transaksi dilindungi enkripsi tingkat bank
            </p>
          </div>

          {/* Logout Button - Compact */}
          <div className="flex justify-center pt-2 border-t border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={!!isProcessing}
              className="text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg"
            >
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}