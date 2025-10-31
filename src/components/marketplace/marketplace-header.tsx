// src/components/marketplace/marketplace-header.tsx

import { Suspense } from "react";
import { Sparkles, Coins, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { LanguageToggle } from "~/components/language-toggle";
import { useTranslations } from "~/components/language-provider";
import { useSession } from "~/lib/auth-client";
import type { ModalType } from "~/lib/types";

interface MarketplaceHeaderProps {
  credits: number | null;
  onOpenModal: (modal: ModalType) => void;
}

export function MarketplaceHeader({
  credits,
  onOpenModal,
}: MarketplaceHeaderProps) {
  const translations = useTranslations();
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50 shadow-[0_1px_0_0_#ECECEC_inset]">
      <div className="container-tight flex h-[60px] items-center justify-between py-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 flex h-8 w-8 items-center justify-center rounded-lg shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-brand-700 text-xl font-bold">
            {translations.marketplace.brandName}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <LanguageToggle />
          </Suspense>

          {session?.user && credits !== null && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold shadow-sm">
              <Coins className="h-4 w-4 text-orange-500" />
              <span>TP {credits}</span>
            </div>
          )}

          {session?.user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenModal("settings")}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
          ) : (
            <Button size="sm" onClick={() => onOpenModal("auth")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
