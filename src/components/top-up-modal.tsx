// src/components/top-up-modal.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useTranslations } from "~/components/language-provider";
import { formatTranslation } from "~/lib/i18n";
import { PRODUCT_CONFIG } from "~/lib/constants";
import { toast } from "sonner";
import { X, Loader2, Coins } from "lucide-react";
import { cn } from "~/lib/utils";
import { useSession } from "~/lib/auth-client";
import { useCredits } from "~/hooks/use-credits";

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
  const tCommon = translations.common.actions;

  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");

  // Ambil data sesi dan kredit
  const { data: session } = useSession();
  const { credits } = useCredits(); // Hook ini sudah mengambil kredit terbaru

  const user = session?.user;

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

  const handleLogout = async () => {
    try {
      // Assuming there's a signOut function available
      const { authClient } = await import("~/lib/auth-client");
      await authClient.signOut();
      toast.success("Logout berhasil");
      onClose(); // Tutup modal
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout gagal. Silakan coba lagi.");
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
        {/* Visually Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">
          {t.title}
        </DialogTitle>
        
        {/* Custom header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-medium text-foreground">
            {user
              ? formatTranslation(t.header, { email: user.email ?? "User" })
              : t.title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto rounded-md px-3 py-1.5 text-xs"
            onClick={onClose}
            disabled={!!isProcessing}
            aria-label={tCommon.close}
          >
            {tCommon.close}
          </Button>
        </div>

        <div className="flex flex-col">
          {/* 2. Container yang berisi konten isi kredit si User */}
          <div className="border-b py-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-xl font-bold text-foreground">
                  {formatTranslation(t.balance, { count: credits ?? 0 })}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTranslation(t.balanceDetails, {
                  regular: credits ?? 0,
                  daily: 0,
                })}
              </span>
            </div>
          </div>

          {/* 3. Container Top UP section ada 3 pilihan card grid nya menyamping */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">🔥 {t.title}</h3>
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

            {/* Product cards grid - showing them side by side in desktop view */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {products.map((product) => {
                // Determine if this product has a badge variant
                const hasBadgeVariant = 'badgeVariant' in product;
                const badgeVariant = hasBadgeVariant ? product.badgeVariant : undefined;
                
                return (
                  <div
                    key={product.id}
                    className={cn(
                      "relative rounded-xl border-2 p-3 pt-6 text-center transition-all",
                      badgeVariant === "popular"
                        ? "border-green-500 bg-green-500/10"
                        : "border-border bg-background",
                    )}
                  >
                    {renderBadge(product)}
                    <p className="text-xs text-muted-foreground line-through">
                      {formatCurrency(product.originalAmount, currency)}
                    </p>
                    <p className="mb-2 text-lg font-bold text-foreground">
                      {formatCurrency(product.amount, currency)}
                    </p>
                    <div className="mb-2 flex items-center justify-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <p className="text-base font-semibold text-foreground">
                        {product.credits}{" "}
                        <span className="text-green-600">
                          + {product.bonusCredits}
                        </span>
                      </p>
                    </div>
                    <p className="mb-3 text-xs font-medium text-green-600">
                      {product.bonusCredits} {t.creditsSuffix}
                    </p>

                    <Button
                      onClick={() => handlePurchase(product.id)}
                      disabled={isProcessing === product.id}
                      className={cn(
                        "w-full font-semibold text-xs",
                        badgeVariant === "popular"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      {isProcessing === product.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        t.purchaseCta
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Dengan membeli kamu setuju dengan syarat dan ketentuan */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground" 
               dangerouslySetInnerHTML={{
                 __html: formatTranslation(t.terms, {
                   terms: `<a href="/terms" target="_blank" rel="noopener noreferrer" class="underline">${t.termsLink}</a>`,
                 })
               }}>
            </p>
          </div>

          {/* 5. Terakhir button logout untuk User */}
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={!!isProcessing}
              className="text-muted-foreground hover:text-destructive text-xs"
            >
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}