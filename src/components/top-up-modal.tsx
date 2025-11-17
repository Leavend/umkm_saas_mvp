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
import { Loader2, Coins, Clock, Check, CreditCard } from "lucide-react";
import { cn } from "~/lib/utils";
import { useSession } from "~/lib/auth-client";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "w-full max-h-[95vh] overflow-hidden rounded-2xl md:rounded-3xl border-0 bg-white/95 shadow-2xl backdrop-blur-xl",
        "mx-2 max-w-[calc(100vw-1rem)] md:mx-4 md:max-w-4xl lg:max-w-5xl",
        "p-0"
      )}>
        <DialogTitle className="sr-only">{t.title}</DialogTitle>

        {/* Enhanced Responsive Header */}
        <div className="relative overflow-hidden border-b border-slate-200/60 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
          {/* Optimized animated background elements for mobile */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 h-32 w-32 sm:h-48 sm:w-48 md:h-64 md:w-64 animate-pulse rounded-full bg-gradient-to-bl from-blue-100/50 to-transparent blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-24 w-24 sm:h-32 sm:w-32 md:h-48 md:w-48 animate-pulse rounded-full bg-gradient-to-tr from-indigo-100/50 to-transparent blur-3xl delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 hidden sm:block h-48 w-48 md:h-64 md:w-64 lg:h-96 lg:w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-blue-50/30 via-indigo-50/20 to-purple-50/30 blur-3xl"></div>
          </div>

          <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-6 md:px-8 lg:px-8">
            <CompactModalHeader
              title={
                user
                  ? formatTranslation(t.header, { name: user.name ?? "User" })
                  : t.title
              }
              onClose={onClose}
              closeDisabled={!!isProcessing}
              closeButtonLabel={tCommon.close}
              className="mb-4 sm:mb-6 text-slate-800 [&_button]:hover:bg-slate-100/80 [&_h1]:text-slate-800"
            />

            {/* Responsive Balance Display */}
            <div className="rounded-xl md:rounded-2xl border border-white/60 bg-white/80 p-4 sm:p-5 md:p-6 shadow-xl backdrop-blur-xl">
              <div className={cn(
                "flex items-center justify-between",
                "gap-4 md:gap-6"
              )}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 opacity-60 blur-md"></div>
                    <div className="relative rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 sm:p-3 shadow-lg">
                      <Coins className={cn(
                        "text-white",
                        "h-5 w-5 sm:h-6 sm:w-6"
                      )} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "mb-1 font-semibold text-slate-600",
                      "text-xs sm:text-sm"
                    )}>
                      Saldo Tersedia
                    </p>
                    <p className={cn(
                      "font-bold text-slate-800 truncate",
                      "text-xl sm:text-2xl md:text-3xl"
                    )}>
                      {formatTranslation(t.balance, { count: credits ?? 0 })}
                    </p>
                    <p className={cn(
                      "text-slate-500",
                      "text-xs sm:text-xs"
                    )}>
                      Kredit siap digunakan
                    </p>
                  </div>
                </div>
                
                <div className={cn(
                  "space-y-2 sm:space-y-3 text-right flex-shrink-0",
                  "text-xs sm:text-sm"
                )}>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Check className={cn(
                      "text-green-500",
                      "h-3 w-3 sm:h-4 sm:w-4"
                    )} />
                    <span className="font-medium hidden sm:inline">Paket terbaik</span>
                    <span className="font-medium sm:hidden">Terbaik</span>
                  </div>
                  <Badge className={cn(
                    "border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transition-all hover:from-green-600 hover:to-emerald-600",
                    "px-2 py-1 sm:px-3 sm:py-1.5",
                    "text-xs sm:text-sm font-semibold"
                  )}>
                    <Coins className={cn(
                      "text-white",
                      "mr-1 h-2.5 w-2.5 sm:mr-1.5 sm:h-3 sm:w-3"
                    )} />
                    <span className="hidden sm:inline">Hemat hingga 70%</span>
                    <span className="sm:hidden">70% OFF</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Main Content */}
        <div className={cn(
          "space-y-6 sm:space-y-8",
          "px-4 py-4 sm:px-6 sm:py-6 lg:px-8",
          "overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(95vh-240px)]"
        )}>
          {/* Enhanced Responsive Section Header */}
          <div className="space-y-3 sm:space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className={cn(
                "h-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500",
                "w-8 sm:w-12"
              )}></div>
              <div className={cn(
                "rounded-full bg-gradient-to-br from-blue-100 to-indigo-100",
                "p-1.5 sm:p-2"
              )}>
                <CreditCard className={cn(
                  "text-blue-600",
                  "h-4 w-4 sm:h-5 sm:w-5"
                )} />
              </div>
              <div className={cn(
                "h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500",
                "w-8 sm:w-12"
              )}></div>
            </div>
            <h2 className={cn(
              "bg-gradient-to-r from-slate-800 via-blue-800 to-slate-800 bg-clip-text font-bold text-transparent",
              "text-lg sm:text-xl md:text-2xl"
            )}>
              {t.title}
            </h2>
            <p className={cn(
              "mx-auto leading-relaxed text-slate-600",
              "text-sm sm:text-base max-w-2xl"
            )}>
              {t.description}
            </p>
          </div>

          {/* Enhanced Responsive Product Cards Grid */}
          <div className={cn(
            "grid gap-4 sm:gap-5 md:gap-6",
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
                    "group relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300",
                    "border hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-xl sm:hover:shadow-2xl",
                    "touch-manipulation", // Better touch response on mobile
                    isPopular
                      ? "bg-gradient-to-br from-white to-green-50/50 shadow-lg sm:shadow-xl ring-1 sm:ring-2 ring-green-200 hover:ring-green-300"
                      : isBestValue
                        ? "transform bg-gradient-to-br from-white to-orange-50/50 shadow-xl sm:shadow-2xl ring-1 sm:ring-2 ring-orange-200 hover:ring-orange-300 md:scale-[1.02] hover:scale-[1.01] sm:hover:scale-[1.02]"
                        : "border-slate-200 bg-white shadow-md sm:shadow-lg hover:border-slate-300 hover:shadow-xl",
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
                    "relative space-y-4 sm:space-y-5 md:space-y-6",
                    "p-4 sm:p-5 md:p-6"
                  )}>
                    {/* Enhanced Responsive Badge */}
                    {isPopular || isBestValue ? (
                      <div className="flex justify-center">
                        <Badge
                          className={cn(
                            "relative rounded-full border-0 text-white shadow-lg",
                            "transform transition-all duration-200 hover:scale-105",
                            "px-3 py-1.5 sm:px-4 sm:py-2",
                            "text-xs sm:text-sm font-bold",
                            isPopular
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/50"
                              : "bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/50",
                          )}
                        >
                          <Coins className={cn(
                            "text-white",
                            "mr-1 sm:mr-2",
                            "h-2.5 w-2.5 sm:h-3 sm:w-3"
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

                    {/* Responsive Product Header */}
                    <div className={cn(
                      "space-y-2 sm:space-y-3 text-center"
                    )}>
                      <div className="flex justify-center">
                        <div
                          className={cn(
                            "rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-lg",
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
                            "h-4 w-4 sm:h-5 sm:w-5"
                          )} />
                        </div>
                      </div>
                      <h3
                        className={cn(
                          "font-bold tracking-tight",
                          "text-sm sm:text-base md:text-lg",
                          isPopular && "text-green-700",
                          isBestValue && "text-orange-700",
                          !isPopular && !isBestValue && "text-slate-700",
                        )}
                      >
                        {product.name}
                      </h3>
                    </div>

                    {/* Responsive Pricing */}
                    <div className={cn(
                      "space-y-1 sm:space-y-2 text-center"
                    )}>
                      <div className="flex items-baseline justify-center gap-1 sm:gap-2">
                        <span className={cn(
                          "font-bold text-slate-800",
                          "text-2xl sm:text-3xl md:text-4xl"
                        )}>
                          {formatCurrency(product.amount).split(".")[0]}
                        </span>
                        <span className={cn(
                          "text-slate-500 line-through",
                          "text-xs sm:text-sm"
                        )}>
                          {formatCurrency(product.originalAmount)}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                        <Check className="h-3 w-3" />
                        Hemat {product.discount}%
                      </div>
                    </div>

                                        {/* Responsive Credits Display */}
                    <div className={cn(
                      "bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl sm:rounded-2xl",
                      "border border-slate-200/60",
                      "p-3 sm:p-4"
                    )}>
                      <div className={cn(
                        "text-center space-y-1 sm:space-y-2"
                      )}>
                        <p className={cn(
                          "font-semibold text-slate-700",
                          "text-xs sm:text-sm"
                        )}>
                          Total Kredit
                        </p>
                        <div className="space-y-1">
                          <p className={cn(
                            "font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",
                            "text-xl sm:text-2xl md:text-3xl"
                          )}>
                            {product.credits + product.bonusCredits}
                          </p>
                          <p className={cn(
                            "text-slate-600",
                            "text-xs sm:text-xs"
                          )}>
                            {product.credits} + {product.bonusCredits} bonus
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced CTA Button */}
                    <Button
                      onClick={() => handlePurchase(product.id)}
                      disabled={isProcessing === product.id}
                      className={cn(
                        "w-full rounded-xl py-4 text-base font-bold transition-all duration-200",
                        "transform shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-95",
                        isPopular
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/30 hover:from-green-700 hover:to-emerald-700"
                          : isBestValue
                            ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-orange-500/30 hover:from-orange-700 hover:to-amber-700"
                            : "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-slate-500/30 hover:from-slate-800 hover:to-slate-900",
                      )}
                    >
                      {isProcessing === product.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
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

          {/* Enhanced Responsive Trust Indicators */}
          <div className={cn(
            "grid gap-4 sm:gap-5 md:gap-6",
            "grid-cols-1 sm:grid-cols-3 py-4 sm:py-5 md:py-6"
          )}>
            <div className={cn(
              "group space-y-3 sm:space-y-4 rounded-xl sm:rounded-2xl",
              "border border-blue-100/60 bg-gradient-to-br from-blue-50/80 to-indigo-50/40",
              "p-4 sm:p-5 md:p-6 text-center transition-all duration-200",
              "hover:border-blue-200/80 touch-manipulation"
            )}>
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 opacity-60 blur-md"></div>
                <div className={cn(
                  "relative flex items-center justify-center rounded-xl sm:rounded-2xl",
                  "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg",
                  "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                )}>
                  <Clock className={cn(
                    "text-white",
                    "h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
                  )} />
                </div>
              </div>
              <div className={cn(
                "space-y-1 sm:space-y-2"
              )}>
                <h4 className={cn(
                  "font-bold text-slate-800",
                  "text-xs sm:text-sm md:text-base"
                )}>
                  Proses Instan
                </h4>
                <p className={cn(
                  "text-slate-600 leading-relaxed",
                  "text-xs sm:text-xs md:text-sm"
                )}>
                  Kredit langsung masuk setelah pembayaran
                </p>
              </div>
            </div>

            <div className={cn(
              "group space-y-3 sm:space-y-4 rounded-xl sm:rounded-2xl",
              "border border-green-100/60 bg-gradient-to-br from-green-50/80 to-emerald-50/40",
              "p-4 sm:p-5 md:p-6 text-center transition-all duration-200",
              "hover:border-green-200/80 touch-manipulation"
            )}>
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 opacity-60 blur-md"></div>
                <div className={cn(
                  "relative flex items-center justify-center rounded-xl sm:rounded-2xl",
                  "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg",
                  "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                )}>
                  <Check className={cn(
                    "text-white",
                    "h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
                  )} />
                </div>
              </div>
              <div className={cn(
                "space-y-1 sm:space-y-2"
              )}>
                <h4 className={cn(
                  "font-bold text-slate-800",
                  "text-xs sm:text-sm md:text-base"
                )}>
                  Bonus Harian
                </h4>
                <p className={cn(
                  "text-slate-600 leading-relaxed",
                  "text-xs sm:text-xs md:text-sm"
                )}>
                  +1 kredit gratis setiap hari
                </p>
              </div>
            </div>

            <div className={cn(
              "group space-y-3 sm:space-y-4 rounded-xl sm:rounded-2xl",
              "border border-purple-100/60 bg-gradient-to-br from-purple-50/80 to-violet-50/40",
              "p-4 sm:p-5 md:p-6 text-center transition-all duration-200",
              "hover:border-purple-200/80 touch-manipulation"
            )}>
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 opacity-60 blur-md"></div>
                <div className={cn(
                  "relative flex items-center justify-center rounded-xl sm:rounded-2xl",
                  "bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg",
                  "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                )}>
                  <Check className={cn(
                    "text-white",
                    "h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
                  )} />
                </div>
              </div>
              <div className={cn(
                "space-y-1 sm:space-y-2"
              )}>
                <h4 className={cn(
                  "font-bold text-slate-800",
                  "text-xs sm:text-sm md:text-base"
                )}>
                  100% Aman
                </h4>
                <p className={cn(
                  "text-slate-600 leading-relaxed",
                  "text-xs sm:text-xs md:text-sm"
                )}>
                  Pembayaran tersertifikasi & terlindungi
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Responsive Security & Terms */}
          <div className={cn(
            "rounded-xl sm:rounded-2xl border border-slate-200/60",
            "bg-gradient-to-r from-slate-50 to-blue-50/30",
            "p-4 sm:p-5 md:p-6"
          )}>
            <div className={cn(
              "space-y-3 sm:space-y-4 text-center"
            )}>
              <div className={cn(
                "flex items-center justify-center gap-2 text-slate-600",
                "px-2"
              )}>
                <Check className={cn(
                  "text-green-500",
                  "h-4 w-4 sm:h-5 sm:w-5"
                )} />
                <span className={cn(
                  "font-semibold",
                  "text-sm sm:text-base"
                )}>
                  Transaksi Terlindungi
                </span>
              </div>
              <p
                className={cn(
                  "leading-relaxed text-slate-600",
                  "text-xs sm:text-sm md:text-base",
                  "px-2 sm:px-4"
                )}
                dangerouslySetInnerHTML={{
                  __html: formatTranslation(t.terms, {
                    terms: `<a href="/terms" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold hover:text-blue-800 underline transition-colors touch-manipulation">${t.termsLink}</a>`,
                  }),
                }}
              />
              <div className={cn(
                "flex items-center justify-center gap-2 sm:gap-4",
                "pt-2 sm:pt-3 text-xs sm:text-sm text-slate-500"
              )}>
                <div className="flex items-center gap-1 min-w-0">
                  <Check className={cn(
                    "text-green-500 flex-shrink-0",
                    "h-3 w-3 sm:h-4 sm:w-4"
                  )} />
                  <span className="truncate">SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <Check className={cn(
                    "text-green-500 flex-shrink-0",
                    "h-3 w-3 sm:h-4 sm:w-4"
                  )} />
                  <span className="truncate">Bank Grade Security</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Responsive Footer Actions */}
          <div className={cn(
            "flex justify-center border-t border-slate-200/60",
            "pt-4 sm:pt-5 md:pt-6"
          )}>
            <Button
              variant="ghost"
              size={isProcessing ? "sm" : "default"}
              onClick={handleLogout}
              disabled={!!isProcessing}
              className={cn(
                "rounded-xl transition-all duration-200",
                "hover:bg-red-50 hover:text-red-600 active:bg-red-100",
                "text-slate-600 hover:text-red-600 touch-manipulation",
                isProcessing
                  ? "px-4 py-2 text-sm"
                  : "px-6 py-3 sm:px-8 sm:py-3",
                "min-h-[44px] sm:min-h-[40px] min-w-[120px] sm:min-w-[140px]"
              )}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className={cn(
                    "animate-spin",
                    "h-4 w-4 sm:h-4 sm:w-4"
                  )} />
                  <span className="text-sm">Memproses...</span>
                </div>
              ) : (
                <span className={cn(
                  "font-medium",
                  "text-sm sm:text-base"
                )}>
                  Keluar dari Akun
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
