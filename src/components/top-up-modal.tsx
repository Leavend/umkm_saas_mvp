// src/components/top-up-modal.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useTranslations } from "~/components/language-provider";
import {
  PRODUCT_IDS,
  PRODUCT_NAMES,
  PRODUCT_AMOUNTS,
  PRODUCT_AMOUNTS_USD,
  CREDITS_MAP,
} from "~/lib/constants";
import { toast } from "sonner";

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
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");

  const products = [
    {
      id: PRODUCT_IDS.SMALL,
      name: PRODUCT_NAMES[PRODUCT_IDS.SMALL],
      credits: CREDITS_MAP[PRODUCT_IDS.SMALL],
      amount:
        currency === "USD"
          ? PRODUCT_AMOUNTS_USD[PRODUCT_IDS.SMALL]
          : PRODUCT_AMOUNTS[PRODUCT_IDS.SMALL],
      popular: false,
    },
    {
      id: PRODUCT_IDS.MEDIUM,
      name: PRODUCT_NAMES[PRODUCT_IDS.MEDIUM],
      credits: CREDITS_MAP[PRODUCT_IDS.MEDIUM],
      amount:
        currency === "USD"
          ? PRODUCT_AMOUNTS_USD[PRODUCT_IDS.MEDIUM]
          : PRODUCT_AMOUNTS[PRODUCT_IDS.MEDIUM],
      popular: true,
    },
    {
      id: PRODUCT_IDS.LARGE,
      name: PRODUCT_NAMES[PRODUCT_IDS.LARGE],
      credits: CREDITS_MAP[PRODUCT_IDS.LARGE],
      amount:
        currency === "USD"
          ? PRODUCT_AMOUNTS_USD[PRODUCT_IDS.LARGE]
          : PRODUCT_AMOUNTS[PRODUCT_IDS.LARGE],
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{translations.dashboard.topUp.title}</DialogTitle>
          <p className="text-muted-foreground text-sm">
            {translations.dashboard.topUp.description}
          </p>
        </DialogHeader>

        <div className="space-y-6">
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
          <div className="grid gap-4 sm:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className={`relative rounded-lg border p-6 transition-all hover:shadow-md ${
                  product.popular ? "border-primary shadow-sm" : ""
                }`}
              >
                {product.popular && (
                  <Badge className="bg-primary absolute -top-2 left-4">
                    Most Popular
                  </Badge>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-2xl font-bold">
                      {currency === "USD" ? "$" : "Rp"}
                      {(product.amount ?? 0).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {product.credits}{" "}
                      {translations.dashboard.topUp.creditsSuffix}
                    </p>
                  </div>

                  <Button
                    onClick={() => handlePurchase(product.id)}
                    disabled={isProcessing === product.id}
                    className="w-full"
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
          <div className="text-muted-foreground text-center text-sm">
            <p>{translations.dashboard.topUp.benefit}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
