// src/components/top-up-modal.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useTranslations } from "~/components/language-provider";
import { formatTranslation } from "~/lib/i18n";
import { PRODUCT_CONFIG } from "~/lib/constants";
import { toast } from "sonner";
import { X, Loader2, Coins } from "lucide-react";
import { cn } from "~/lib/utils";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  onCreditsUpdate?: (newCredits: number) => void;
}

// Helper untuk format harga
const formatCurrency = (amount: number, currency: "IDR" | "USD") => {
  if (currency === "USD") {
    return `${amount}`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

export function TopUpModal({
  isOpen,
  onClose,
  lang: _lang,
  onCreditsUpdate: _onCreditsUpdate,
}: TopUpModalProps) {
  const translations = useTranslations();
  const t = translations.dashboard.topUp;

  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");

  const products = [
    {
      ...PRODUCT_CONFIG.SMALL,
      originalAmount: 29000,
      amount:
        currency === "USD"
          ? PRODUCT_CONFIG.SMALL.usdAmount
          : PRODUCT_CONFIG.SMALL.amount,
    },
    {
      ...PRODUCT_CONFIG.MEDIUM,
      originalAmount: 49000,
      amount:
        currency === "USD"
          ? PRODUCT_CONFIG.MEDIUM.usdAmount
          : PRODUCT_CONFIG.MEDIUM.amount,
    },
    {
      ...PRODUCT_CONFIG.LARGE,
      originalAmount: 99000,
      amount:
        currency === "USD"
          ? PRODUCT_CONFIG.LARGE.usdAmount
          : PRODUCT_CONFIG.LARGE.amount,
    },
  ];

  const handlePurchase = async (productId: string) => {
    setIsProcessing(productId);
    try {
      const response = await fetch("/api/xendit/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          currency,
        }),
      });

      const data = (await response.json()) as {
        invoiceUrl?: string;
        error?: string;
      };

      if (response.ok && data.invoiceUrl) {
        // Redirect ke Xendit
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

  const renderBadge = (product: (typeof products)[number]) => {
    // Check if product has badge property
    if (!('badge' in product) || !product.badge) return null;

    let badgeClass = "";
    let badgeText: string = product.badge;

    // Check if product has badgeVariant property
    if ('badgeVariant' in product) {
      if (product.badgeVariant === "popular") {
        // Kelas untuk "Paling Laris" / "Hemat X%" (Hijau)
        badgeClass = "bg-green-100 text-green-800 border-green-200";
        if (product.badge.includes("Hemat")) {
          badgeText = `💸 ${formatTranslation(t.badgeSave, { percent: 24 })}`;
        } else {
          badgeText = `🌟 ${t.badgePopular}`;
        }
      } else if (product.badgeVariant === "best-value") {
        // Kelas untuk "Paling Untung" (Oranye)
        badgeClass = "bg-orange-100 text-orange-800 border-orange-200";
        badgeText = `🔥 ${t.badgeBestValue}`;
      }
    }

    return (
      <Badge
        variant="outline"
        className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold",
          badgeClass,
        )}
      >
        {badgeText}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-4 max-h-[95vh] w-full max-w-md overflow-y-auto rounded-xl p-6 shadow-xl sm:mx-0">
        {/* Tombol Close 'X' Kustom */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          disabled={!!isProcessing}
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col">
          {/* 1. Header (Sesuai Gambar 16.02.43.png) */}
          <div className="mt-4 space-y-3 text-center">
            <h3 className="text-xl font-bold text-foreground">
              🔥 {t.title}
            </h3>
            <p className="text-sm text-muted-foreground">{t.description}</p>
            <div className="flex justify-center pt-2">
              <div className="flex rounded-lg border bg-muted p-1">
                <button
                  onClick={() => setCurrency("IDR")}
                  className={cn(
                    "rounded-md px-4 py-1 text-sm font-medium transition-colors",
                    currency === "IDR"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  IDR
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={cn(
                    "rounded-md px-4 py-1 text-sm font-medium transition-colors",
                    currency === "USD"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  USD
                </button>
              </div>
            </div>
          </div>

          {/* 2. Kartu Produk (Single Column Grid) */}
          <div className="mt-8 grid grid-cols-1 gap-5">
            {products.map((product) => {
              // Determine if this product has a badge variant
              const hasBadgeVariant = 'badgeVariant' in product;
              const badgeVariant = hasBadgeVariant ? product.badgeVariant : undefined;
              
              return (
                <div
                  key={product.id}
                  className={cn(
                    "relative rounded-xl border-2 p-4 pt-6 text-center transition-all",
                    badgeVariant === "popular"
                      ? "border-green-500 bg-green-500/10"
                      : "border-border bg-background",
                  )}
                >
                  {renderBadge(product)}
                  <p className="text-sm text-muted-foreground line-through">
                    {formatCurrency(product.originalAmount, currency)}
                  </p>
                  <p className="mb-2 text-3xl font-bold text-foreground">
                    {formatCurrency(product.amount, currency)}
                  </p>
                  <div className="mb-3 flex items-center justify-center gap-1.5">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <p className="text-lg font-semibold text-foreground">
                      {product.credits}{" "}
                      <span className="text-green-600">
                        + {product.bonusCredits}
                      </span>
                    </p>
                  </div>
                  <p className="mb-4 text-sm font-medium text-green-600">
                    {product.bonusCredits} {t.creditsSuffix}
                  </p>

                  <Button
                    onClick={() => handlePurchase(product.id)}
                    disabled={isProcessing === product.id}
                    className={cn(
                      "w-full font-semibold",
                      badgeVariant === "popular"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    {isProcessing === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t.purchaseCta
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* 3. Footer (Dihapus sesuai 16.02.43.png) */}
        </div>
      </DialogContent>
    </Dialog>
  );
}