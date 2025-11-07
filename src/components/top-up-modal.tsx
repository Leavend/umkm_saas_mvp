// src/components/top-up-modal.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useTranslations } from "~/components/language-provider";
import { formatTranslation } from "~/lib/i18n";
import { PRODUCT_CONFIG } from "~/lib/constants";
import { toast } from "sonner";
import { X, Loader2, Coins } from "lucide-react";
import { authClient, useSession } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocalePath } from "~/components/language-provider";
import { useCredits } from "~/hooks/use-credits"; // Impor hook credits
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
  onCreditsUpdate,
}: TopUpModalProps) {
  const translations = useTranslations();
  const t = translations.dashboard.topUp;
  const tCommon = translations.common.actions;

  const router = useRouter();
  const toLocalePath = useLocalePath();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
  ] as const;

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
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      toast.success("Logout berhasil");
      onClose(); // Tutup modal
      router.push(toLocalePath("/")); // Redirect ke home
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout gagal. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
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
        badgeClass = "bg-green-100 text-green-800";
        badgeText = `🌟 ${t.badgePopular}`;
      } else if (product.badgeVariant === "best-value") {
        badgeClass = "bg-orange-100 text-orange-800";
        badgeText = `🔥 ${t.badgeBestValue}`;
      } else {
        badgeClass = "bg-blue-100 text-blue-800";
      }
    }

    // Untuk "Hemat 24%"
    if (product.badge?.includes("Hemat")) {
      badgeText = `💸 ${formatTranslation(t.badgeSave, { percent: 24 })}`;
    }

    return (
      <Badge
        variant="outline"
        className={cn(
          "absolute -top-2.5 left-1/2 -translate-x-1/2 border-none px-3 py-1 text-xs font-semibold",
          badgeClass,
        )}
      >
        {badgeText}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-4 w-full max-w-md rounded-xl p-0 shadow-xl sm:mx-0">
        {/* 1. Header Baru (Sesuai Gambar 3) */}
        <DialogHeader className="sticky top-0 z-10 flex flex-row items-center justify-between space-y-0 border-b bg-background p-4">
          <DialogTitle className="text-sm font-medium text-foreground">
            {user
              ? formatTranslation(t.header, { email: user.email ?? "User" })
              : t.title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto rounded-md px-3 py-1.5 text-xs"
            onClick={onClose}
            disabled={isLoggingOut || !!isProcessing}
            aria-label={tCommon.close}
          >
            {tCommon.close}
          </Button>
        </DialogHeader>

        <div className="flex flex-col p-4 pt-0 sm:p-6 sm:pt-0">
          {/* 2. Saldo Token (Sesuai Gambar 3) */}
          <div className="border-b py-3">
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

          {/* 3. Judul & Toggle Mata Uang */}
          <div className="mt-3 space-y-2 text-center">
            <h3 className="text-base font-bold text-foreground">🔥 {t.title}</h3>
            <p className="text-xs text-muted-foreground">{t.description}</p>
            <div className="flex justify-center pt-1">
              <div className="flex rounded-lg border bg-muted p-1">
                <button
                  onClick={() => setCurrency("IDR")}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
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
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
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

          {/* 4. Kartu Produk (Sesuai Gambar 3) */}
          <div className="mt-4 grid grid-cols-1 gap-3">
            {products.map((product) => {
              // Determine if this product has a badge variant
              const hasBadgeVariant = 'badgeVariant' in product;
              const badgeVariant = hasBadgeVariant ? product.badgeVariant : undefined;
              
              return (
                <div
                  key={product.id}
                  className={cn(
                    "relative rounded-lg border-2 p-3 pt-5 text-center transition-all",
                    badgeVariant === "popular"
                      ? "border-green-500 bg-green-500/5"
                      : "border-border bg-background",
                  )}
                >
                  {renderBadge(product)}
                  <p className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.originalAmount, currency)}
                  </p>
                  <p className="mb-1 text-lg font-bold text-foreground">
                    {formatCurrency(product.amount, currency)}
                  </p>
                  <div className="mb-2 flex items-center justify-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <p className="text-md font-semibold text-foreground">
                      {product.credits}{" "}
                      <span className="text-green-600">
                        + {product.bonusCredits ?? 0}
                      </span>
                    </p>
                  </div>
                  <p className="mb-3 text-xs font-medium text-green-600">
                    {product.bonusCredits ?? 0} {t.creditsSuffix}
                  </p>

                  <Button
                    onClick={() => handlePurchase(product.id)}
                    disabled={isProcessing === product.id}
                    className={cn(
                      "w-full font-semibold text-sm",
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

          {/* 5. Footer Pembayaran & Logout */}
          <div className="mt-3 space-y-2 text-center">
            <p className="text-xs text-muted-foreground">
              {formatTranslation(t.paymentFooter, {
                providers: "(QRIS, Gopay, ShopeePay)",
              })}
            </p>
            <p className="text-xs text-muted-foreground" 
               dangerouslySetInnerHTML={{
                 __html: formatTranslation(t.terms, {
                   terms: `<a href="/terms" target="_blank" rel="noopener noreferrer" class="underline">${t.termsLink}</a>`,
                 })
               }}>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut || !!isProcessing}
              className="text-muted-foreground hover:text-destructive text-xs"
            >
              {isLoggingOut ? (
                <Loader2 className="mr-1 h-2 w-2 animate-spin" />
              ) : null}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
