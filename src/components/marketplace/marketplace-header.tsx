// src/components/marketplace/marketplace-header.tsx

import { Suspense } from "react";
import { Sparkles, Coins, User, Search } from "lucide-react";
import Image from "next/image";
// import { Button } from "~/components/ui/button";
import { Container } from "~/components/container";
import { LanguageToggle } from "~/components/language-toggle";
import { useTranslations } from "~/components/language-provider";
import { useSession } from "~/lib/auth-client";
import type { ModalType } from "~/lib/types";
import { useMarketUI } from "~/stores/use-market-ui";
import { cn } from "~/lib/utils";

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
      className={cn(
        "sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur transition-all duration-300 ease-in-out",
        isSearchOpen && "md:border-b",
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        {/* Brand - shifts towards center when search is open on mobile */}
        <div
          className={cn(
            "flex items-center gap-2 transition-all duration-300 ease-in-out",
            isSearchOpen &&
              "xs:translate-x-1 sm:translate-x-2 md:translate-x-0",
          )}
        >
          <div className="bg-brand-500 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg shadow-lg">
            <Sparkles className="h-5 w-5 text-slate-900" />
          </div>
          <span
            className={cn(
              "text-brand-700 brand-text-truncate text-xl font-bold transition-all duration-300",
              isSearchOpen && "xs:text-base sm:text-lg md:text-xl",
            )}
          >
            {translations.marketplace.brandName}
          </span>
        </div>

        {/* Actions - shifts with more distance when search is open on mobile */}
        <div
          className={cn(
            "flex items-center gap-2 transition-all duration-300 ease-in-out",
            isSearchOpen &&
              "xs:-translate-x-6 sm:-translate-x-8 md:translate-x-0",
          )}
        >
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              isSearchOpen &&
                "xs:-translate-x-1 sm:-translate-x-2 md:translate-x-0",
            )}
          >
            <Suspense fallback={null}>
              <LanguageToggle />
            </Suspense>
          </div>

          <button
            aria-label="Toggle search"
            aria-expanded={isSearchOpen}
            aria-controls="mobile-searchbar"
            onClick={toggleSearch}
            className={cn(btn, isSearchOpen ? on : off)}
            type="button"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Toggle search</span>
          </button>

          {/* JIKA USER SUDAH LOGIN */}
          {session?.user ? (
            <button
              type="button"
              onClick={() => onOpenModal("settings")}
              className="focus-visible:ring-brand-500/40 flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 text-sm font-semibold shadow-sm transition hover:bg-slate-100 focus-visible:ring-2 active:bg-slate-200"
              aria-label="Buka pengaturan pengguna dan lihat kredit"
            >
              {/* Avatar Pengguna */}
              <div className="relative h-7 w-7 overflow-hidden rounded-full bg-slate-100">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User avatar"}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                ) : (
                  <User className="absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-slate-500" />
                )}
              </div>
              {/* Tampilan Kredit */}
              {credits !== null && (
                <>
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span>TP {credits}</span>
                </>
              )}
            </button>
          ) : (
            /* JIKA USER BELUM LOGIN */
            <button
              type="button"
              onClick={() => onOpenModal("auth")}
              className="focus-visible:ring-brand-500/40 inline-flex h-10 w-auto items-center justify-center gap-2 rounded-full border border-slate-200 bg-white p-0 px-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:outline-none active:bg-slate-200"
              aria-label="Login"
            >
              <User className="h-5 w-5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </Container>
    </nav>
  );
}
