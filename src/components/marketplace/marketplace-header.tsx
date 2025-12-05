// src/components/marketplace/marketplace-header.tsx

import { useParams } from "next/navigation";
import { Container } from "~/components/container";
import { useTranslations } from "~/components/language-provider";
import type { ModalType } from "~/lib/types";
import { useAuthSession } from "~/hooks/use-auth-session";
import { useMarketUI } from "~/stores/use-market-ui";
import { cn } from "~/lib/utils";
import { HeaderBrand, HeaderActions } from "./header-parts";

interface MarketplaceHeaderProps {
  credits: number | null;
  onOpenModal: (modal: ModalType) => void;
}

export function MarketplaceHeader({
  credits,
  onOpenModal,
}: MarketplaceHeaderProps) {
  const params = useParams();
  const lang = (params.lang as string) || "en";
  const translations = useTranslations();
  const { isAuthenticated, user, isAdmin } = useAuthSession();
  const { isSearchOpen, toggleSearch } = useMarketUI();

  return (
    <nav
      id="site-header"
      className={cn(
        "sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur transition-all duration-300 ease-in-out",
        isSearchOpen && "md:border-b",
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <HeaderBrand
          isSearchOpen={isSearchOpen}
          brandName={translations.marketplace.brandName}
        />

        <HeaderActions
          isSearchOpen={isSearchOpen}
          toggleSearch={toggleSearch}
          isAdmin={isAdmin}
          lang={lang}
          isAuthenticated={isAuthenticated}
          user={user}
          credits={credits}
          onOpenModal={onOpenModal}
        />
      </Container>
    </nav>
  );
}

