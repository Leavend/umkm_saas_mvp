// src/components/top-up-modal.tsx

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { CompactModalHeader } from "~/components/ui/modal-header";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useTranslations } from "~/components/language-provider";
import { formatTranslation } from "~/lib/i18n";
import { PRODUCT_CONFIG } from "~/lib/constants";
import { toast } from "sonner";
import { Loader2, Coins, Check } from "lucide-react";
import { cn } from "~/lib/utils";
import { useSession, authClient } from "~/lib/auth-client";
import { useCredits } from "~/hooks/use-credits";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  onCreditsUpdate?: (newCredits: number) => void;
}

// Professional UI Constants with Responsive Design
const UI_CONSTANTS = {
  CURRENCY: "IDR" as const,
  ANIMATION_DURATION: "200ms",
  GRID_COLS: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  BREAKPOINTS: {
    sm: "640px",
    md: "768px", 
    lg: "1024px",
    xl: "1280px",
  },
  SPACING: {
    mobile: "16px",
    tablet: "24px",
    desktop: "32px",
  },
  TYPOGRAPHY: {
    mobile: {
      title: "text-xl",
      subtitle: "text-sm",
      body: "text-sm",
      caption: "text-xs",
    },
    desktop: {
      title: "text-2xl",
      subtitle: "text-base", 
      body: "text-base",
      caption: "text-sm",
    },
  },
  COLORS: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      900: "#1e3a8a",
    },
    success: {
      50: "#f0fdf4",
      100: "#dcfce7",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
    },
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
    },
    neutral: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
} as const;

// Helper functions
const formatCurrency = (amount: number): string =>
  `Rp ${amount.toLocaleString("id-ID")}`;

const calculateDiscountPercentage = (
  original: number,
  current: number,
): number => Math.round(((original - current) / original) * 100);

// Enhanced Product configuration with professional styling
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
  gradient: {
    primary: "from-blue-500 to-indigo-600",
    secondary: "from-green-500 to-emerald-600",
    accent: "from-amber-500 to-orange-600",
  },
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

  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "w-full max-h-[80vh] overflow-hidden rounded-md md:rounded-lg border-0 bg-white/95 shadow-md backdrop-blur-xl",
        "mx-0.5 max-w-[calc(100vw-0.25rem)] md:mx-1 md:max-w-lg lg:max-w-xl",
        "p-0"
      )}>
        <DialogTitle className="sr-only">{t.title}</DialogTitle>

        {/* Compact Header */}
        <div className="relative overflow-hidden border-b border-slate-200/60 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
          {/* Minimal background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 animate-pulse rounded-full bg-gradient-to-bl from-blue-100/50 to-transparent blur-xl"></div>
            <div className="absolute bottom-0 left-0 h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 animate-pulse rounded-full bg-gradient-to-tr from-indigo-100/50 to-transparent blur-xl delay-1000"></div>
          </div>

          <div className="relative z-10 px-2 py-2 sm:px-3 sm:py-2 md:px-3 md:py-2">
            <CompactModalHeader
              title={
                user
                  ? formatTranslation(t.header, { name: user.name ?? "User" })
                  : t.title
              }
              onClose={onClose}
              closeDisabled={!!isProcessing}
              closeButtonLabel={tCommon.close}
              className="mb-1 text-slate-800 [&_button]:hover:bg-slate-100/80 [&_h1]:text-slate-800"
            />

            {/* Compact Balance Display */}
            <div className="rounded-md border border-white/60 bg-white/80 p-2 sm:p-3 shadow-sm backdrop-blur-xl">
              <div className={cn(
                "flex items-center justify-between",
                "gap-2"
              )}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 opacity-60 blur-sm"></div>
                    <div className="relative rounded-md bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 shadow-sm">
                      <Coins className={cn(
                        "text-white",
                        "h-3 w-3"
                      )} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "mb-0 font-semibold text-slate-600",
                      "text-xs"
                    )}>
                      Saldo: {formatTranslation(t.balance, { count: credits ?? 0 })}
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <Badge className={cn(
                    "border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm transition-all hover:from-green-600 hover:to-emerald-600",
                    "px-1.5 py-0.5",
                    "text-xs font-semibold"
                  )}>
                    <Coins className={cn(
                      "text-white",
                      "mr-1 h-2 w-2"
                    )} />
                    70% OFF
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Main Content */}
        <div className={cn(
          "space-y-2 sm:space-y-3",
          "px-3 py-3 sm:p-4"
        )}>
          

          {/* Compact Product Cards Grid */}
          <div className={cn(
            "grid gap-2",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}>
            {products.map((product, _index) => {
              const badgeVariant =
                "badgeVariant" in product ? product.badgeVariant : undefined;
              const isPopular = badgeVariant === "popular";
              const isBestValue = badgeVariant === "best-value";

              return (
                <div
                  key={product.id}
                  className={cn(
                    "group relative overflow-hidden rounded-md sm:rounded-lg transition-all duration-200",
                    "border hover:-translate-y-0.5 hover:shadow-md",
                    "touch-manipulation",
                    isPopular
                      ? "bg-gradient-to-br from-white to-green-50/50 shadow-sm sm:shadow-md ring-1 ring-green-200 hover:ring-green-300"
                      : isBestValue
                        ? "transform bg-gradient-to-br from-white to-orange-50/50 shadow-md sm:shadow-lg ring-1 ring-orange-200 hover:ring-orange-300 md:scale-[1.01] hover:scale-[1.005]"
                        : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-sm",
                  )}
                >
                  {/* Enhanced background effects */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                      isPopular &&
                        "bg-gradient-to-br from-green-50/50 to-emerald-50/30",
                      isBestValue &&
                        "bg-gradient-to-br from-orange-50/50 to-amber-50/30",
                    )}
                  ></div>

                  {/* Gradient border effect */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                      isPopular &&
                        "-z-10 bg-gradient-to-br from-green-400/20 to-emerald-400/20 blur-sm",
                      isBestValue &&
                        "-z-10 bg-gradient-to-br from-orange-400/20 to-amber-400/20 blur-sm",
                    )}
                  ></div>

                  <div className={cn(
                    "relative space-y-1",
                    "p-1.5 sm:p-2"
                  )}>
                    {/* Enhanced Responsive Badge */}
                    {isPopular || isBestValue ? (
                      <div className="flex justify-center">
                        <Badge
                          className={cn(
                            "relative rounded-full border-0 text-white shadow-sm",
                            "transform transition-all duration-200 hover:scale-105",
                            "px-1.5 py-0.5 sm:px-2 sm:py-1",
                            "text-xs font-bold",
                            isPopular
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/20"
                              : "bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/20",
                          )}
                        >
                          <Coins className={cn(
                            "text-white",
                            "mr-0.5 sm:mr-1",
                            "h-1.5 w-1.5 sm:h-2 sm:w-2"
                          )} />
                          <span className="hidden sm:inline">
                            {isPopular ? "🌟 Terlaris" : "🚀 Terbaik"}
                          </span>
                          <span className="sm:hidden">
                            {isPopular ? "🌟" : "🚀"}
                          </span>
                        </Badge>
                      </div>
                    ) : null}

                    {/* Ultra Short Product Header */}
                    <div className={cn(
                      "space-y-1 text-center"
                    )}>
                      <div className="flex justify-center">
                        <div
                          className={cn(
                            "rounded-md p-1.5 shadow-sm",
                            isPopular &&
                              "bg-gradient-to-br from-green-400 to-emerald-500",
                            isBestValue &&
                              "bg-gradient-to-br from-orange-400 to-amber-500",
                            !isPopular &&
                              !isBestValue &&
                              "bg-gradient-to-br from-blue-400 to-indigo-500",
                          )}
                        >
                          <Coins className={cn(
                            "text-white",
                            "h-2 w-2 sm:h-2.5 sm:w-2.5"
                          )} />
                        </div>
                      </div>
                      <h3
                        className={cn(
                          "font-bold",
                          "text-xs",
                          isPopular && "text-green-700",
                          isBestValue && "text-orange-700",
                          !isPopular && !isBestValue && "text-slate-700",
                        )}
                      >
                        {product.name}
                      </h3>
                    </div>

                    {/* Ultra Short Pricing */}
                    <div className={cn(
                      "text-center"
                    )}>
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className={cn(
                          "font-bold text-slate-800",
                          "text-xs sm:text-sm"
                        )}>
                          {formatCurrency(product.amount).split(".")[0]}
                        </span>
                        <span className={cn(
                          "text-slate-500 line-through",
                          "text-xs"
                        )}>
                          {formatCurrency(product.originalAmount)}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-1 py-0.5 text-xs font-semibold text-green-800 mt-1">
                        <Check className="h-1.5 w-1.5" />
                        Hemat {product.discount}%
                      </div>
                    </div>

                                        {/* Ultra Short Credits Display */}
                    <div className={cn(
                      "bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-md",
                      "border border-slate-200/60",
                      "p-1"
                    )}>
                      <div className="text-center">
                        <p className={cn(
                          "font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",
                          "text-xs sm:text-sm"
                        )}>
                          {product.credits + product.bonusCredits} kredit
                        </p>
                      </div>
                    </div>

                    {/* Ultra Short CTA Button */}
                    <Button
                      onClick={() => handlePurchase(product.id)}
                      disabled={isProcessing === product.id}
                      className={cn(
                        "w-full rounded-md py-1.5 text-xs font-bold transition-all duration-200",
                        "transform shadow-sm hover:scale-[1.02] active:scale-95",
                        isPopular
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/20 hover:from-green-700 hover:to-emerald-700"
                          : isBestValue
                            ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-orange-500/20 hover:from-orange-700 hover:to-amber-700"
                            : "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-slate-500/20 hover:from-slate-800 hover:to-slate-900",
                      )}
                    >
                      {isProcessing === product.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          <span>Memproses...</span>
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

          {/* Compact Trust Indicators */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              <Check className="h-2 w-2 text-green-500" />
              <span className="text-xs">Instan</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-2 w-2 text-green-500" />
              <span className="text-xs">Bonus</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-2 w-2 text-green-500" />
              <span className="text-xs">Aman</span>
            </div>
          </div>

          {/* Compact Security */}
          <div className="text-center py-2">
            <p className="text-xs text-slate-600">
              <Check className="inline h-2 w-2 text-green-500 mr-1" />
              Transaksi aman dengan SSL & Bank Grade
            </p>
          </div>

          {/* Logout Function */}
          <div className="text-center pt-2">
            <Button
              onClick={async () => {
                try {
                  await authClient.signOut();
                  toast.success("Berhasil keluar");
                  onClose();
                } catch (error) {
                  console.error("Logout error:", error);
                  toast.error("Gagal keluar");
                }
              }}
              variant="outline"
              className={cn(
                "text-xs px-3 py-1.5 border-slate-300 text-slate-600 hover:bg-slate-50",
                "transition-colors duration-200"
              )}
            >
              Keluar dari Akun
            </Button>
          </div>

          
        </div>
      </DialogContent>
    </Dialog>
  );
}
