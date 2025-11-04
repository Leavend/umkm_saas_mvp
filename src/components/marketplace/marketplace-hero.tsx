// src/components/marketplace/marketplace-hero.tsx

import { useTranslations } from "~/components/language-provider";
import { Container } from "~/components/container";
import { cn } from "~/lib/utils";

export function MarketplaceHero() {
  const translations = useTranslations();

  return (
    <section className="pt-8 pb-4 md:pt-10 md:pb-5">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h1
            className={cn(
              "max-w-none leading-[1.1] font-extrabold tracking-tight [text-wrap:balance] md:whitespace-nowrap",
              "text-[clamp(34px,5.2vw,48px)]",
            )}
          >
            {translations.marketplace.hero.titleStart}{" "}
            <span className="text-brand-700">
              {translations.marketplace.hero.titleHighlight}
            </span>
            {translations.marketplace.hero.titleEnd && (
              <> {translations.marketplace.hero.titleEnd}</>
            )}
          </h1>
          <p className="mt-2 max-w-none text-[clamp(14px,1.6vw,18px)] [text-wrap:balance] text-slate-600 md:whitespace-nowrap">
            {translations.marketplace.hero.description}
          </p>
        </div>
      </Container>
    </section>
  );
}
