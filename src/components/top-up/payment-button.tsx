// Payment button component for top-up packages

import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface PaymentButtonProps {
  productId: string;
  isProcessing: boolean;
  isBestValue?: boolean;
  isPopular?: boolean;
  purchaseCta: string;
  processingText: string;
  onPurchase: (productId: string) => void;
}

export function PaymentButton({
  productId,
  isProcessing,
  isBestValue,
  isPopular,
  purchaseCta,
  processingText,
  onPurchase,
}: PaymentButtonProps) {
  return (
    <Button
      onClick={() => onPurchase(productId)}
      disabled={isProcessing}
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
      {isProcessing ? (
        <div className="flex items-center justify-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{processingText}</span>
        </div>
      ) : (
        <span>{purchaseCta}</span>
      )}
    </Button>
  );
}
