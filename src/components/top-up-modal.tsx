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
import { PRODUCT_CONFIG } from "~/lib/constants";
import { toast } from "sonner";
import { X } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocalePath } from "~/components/language-provider";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  onCreditsUpdate?: (newCredits: number) => void;
}

export function TopUpModal({
  isOpen,
  onClose,
  lang: _lang,
  onCreditsUpdate: _onCreditsUpdate,
}: TopUpModalProps) {
  const translations = useTranslations();
  const router = useRouter();
  const toLocalePath = useLocalePath();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");

  const products = [
    {
      id: PRODUCT_CONFIG.SMALL.id,
      name: PRODUCT_CONFIG.SMALL.name,
      credits: PRODUCT_CONFIG.SMALL.credits,
      amount:
        currency === "USD"
          ? PRODUCT_CONFIG.SMALL.usdAmount
          : PRODUCT_CONFIG.SMALL.amount,
      popular: false,
    },
    {
      id: PRODUCT_CONFIG.MEDIUM.id,
      name: PRODUCT_CONFIG.MEDIUM.name,
      credits: PRODUCT_CONFIG.MEDIUM.credits,
      amount:
        currency === "USD"
          ? PRODUCT_CONFIG.MEDIUM.usdAmount
          : PRODUCT_CONFIG.MEDIUM.amount,
      popular: true,
    },
    {
      id: PRODUCT_CONFIG.LARGE.id,
      name: PRODUCT_CONFIG.LARGE.name,
      credits: PRODUCT_CONFIG.LARGE.credits,
      amount:
        currency === "USD"
          ? PRODUCT_CONFIG.LARGE.usdAmount
          : PRODUCT_CONFIG.LARGE.amount,
      popular: false,
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
        // Redirect to Xendit payment page
        window.location.href = data.invoiceUrl;
      } else {
        toast.error(data.error ?? "Failed to create payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      toast.success("Logout berhasil");
      onClose(); // Close modal
      router.push(toLocalePath("/")); // Redirect to home
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout gagal. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-4 sm:mx-0 sm:max-w-2xl">
        {/* Custom close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-8 w-8 rounded-full p-0"
          onClick={onClose}
          disabled={isLoggingOut || !!isProcessing}
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader className="pr-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg sm:text-xl">
                {translations.dashboard.topUp.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {translations.dashboard.topUp.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Currency Toggle */}
          <div className="flex justify-center">
            <div className="flex rounded-lg border p-1">
              <button
                onClick={() => setCurrency("IDR")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  currency === "IDR"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                IDR
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  currency === "USD"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                USD
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`relative rounded-lg border p-4 transition-all hover:shadow-md sm:p-6 ${
                  product.popular ? "border-primary shadow-sm" : ""
                }`}
              >
                {product.popular && (
                  <Badge className="bg-primary absolute -top-2 left-2 text-xs sm:left-4">
                    Most Popular
                  </Badge>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold sm:text-base">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold sm:text-2xl">
                      {currency === "USD" ? "$" : "Rp"}
                      {(product.amount ?? 0).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {product.credits}{" "}
                      {translations.dashboard.topUp.creditsSuffix}
                    </p>
                  </div>

                  <Button
                    onClick={() => handlePurchase(product.id)}
                    disabled={isProcessing === product.id}
                    className="w-full text-xs sm:text-sm"
                    variant={product.popular ? "default" : "outline"}
                  >
                    {isProcessing === product.id
                      ? translations.dashboard.topUp.processing
                      : translations.dashboard.topUp.purchaseCta}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Text */}
          <div className="text-muted-foreground text-center text-xs sm:text-sm">
            <p>{translations.dashboard.topUp.benefit}</p>
          </div>

          {/* Logout Button */}
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut || !!isProcessing}
              className="text-muted-foreground hover:text-destructive flex items-center gap-2 text-xs"
            >
              {isLoggingOut ? (
                <>
                  <div className="border-muted-foreground h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">↪</span>
                  <span>Logout</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
