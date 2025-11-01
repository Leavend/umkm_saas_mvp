// src/components/marketplace/marketplace-header.tsx

import { Suspense } from "react";
import { Sparkles, Coins, User, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/container";
import { LanguageToggle } from "~/components/language-toggle";
import { useTranslations } from "~/components/language-provider";
import { useSession } from "~/lib/auth-client";
import type { ModalType } from "~/lib/types";
import { useMarketUI } from "~/stores/use-market-ui";
import { cn } from "~/lib/utils";
import Link from "next/link";

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
  const { isSearchOpen, toggleSearch } = useMarketUI();

  const btn =
    "md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full " +
    "border border-slate-200 bg-white shadow-sm transition focus-visible:ring-2 focus-visible:ring-brand-500/40";
  const on = "bg-[#FFC72C] text-slate-900 border-[#FFC72C]";
  const off = "hover:bg-slate-100";

  return (
    <nav
      id="site-header"
      className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur"
    >
      <Container className="flex h-16 items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 flex h-8 w-8 items-center justify-center rounded-lg shadow-lg">
            <Sparkles className="h-5 w-5 text-slate-900" />
          </div>
          <span className="text-brand-700 text-xl font-bold">
            {translations.marketplace.brandName}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <LanguageToggle />
          </Suspense>

          <button
            aria-label="Toggle search"
            aria-expanded={isSearchOpen}
            aria-controls="mobile-searchbar"
            onClick={toggleSearch}
            className={cn(btn, isSearchOpen ? on : off)}
          >
            <Search className="h-5 w-5" />
          </button>

          {session?.user && credits !== null && (
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold shadow-sm sm:flex">
              <Coins className="h-4 w-4 text-orange-500" />
              <span>TP {credits}</span>
            </div>
          )}

          {session?.user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenModal("settings")}
              className="hidden gap-2 sm:inline-flex"
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
          ) : null}

          {!session?.user && (
            <Link
              href="/signin"
              className="focus-visible:ring-brand-500/40 inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:outline-none active:bg-slate-200 md:px-4"
            >
              Sign In
            </Link>
          )}
        </div>
      </Container>
    </nav>
  );
}
