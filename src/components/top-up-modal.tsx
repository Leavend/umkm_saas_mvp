// Top-up modal component - Refactored

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import { formatTranslation } from "~/lib/i18n";
import { PRODUCT_CONFIG } from "~/lib/constants";
import { toast } from "sonner";
import { Coins, Check, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { createProductConfig, PackageList } from "./top-up";
import type { TopUpTranslations } from "./top-up";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
  credits: number | null;
  onCreditsUpdate?: (newCredits: number) => void;
}

export function TopUpModal({
  isOpen,
  onClose,
  lang: _lang,
  credits,
  onCreditsUpdate: _onCreditsUpdate,
}: TopUpModalProps) {
  const translations = useTranslations();
  const t = translations.dashboard.topUp as TopUpTranslations;
  const tCommon = translations.common.actions;

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Get user session
  const { data: session } = useSession();
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
          <PackageList
            products={products}
            packageNames={packageNames}
            isProcessingId={isProcessing}
            translations={t}
            onPurchase={handlePurchase}
          />

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
