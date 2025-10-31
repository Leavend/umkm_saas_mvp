// src/components/marketplace/marketplace-hero.tsx

import { useTranslations, useLanguage } from "~/components/language-provider";
import { Container } from "~/components/container";
import { cn } from "~/lib/utils";

export function MarketplaceHero() {
  const translations = useTranslations();
  const { lang } = useLanguage();

  return (
    <section className="pt-8 pb-4 md:pt-10 md:pb-5">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h1
            className={cn(
              "font-extrabold tracking-tight leading-[1.1] [text-wrap:balance] md:whitespace-nowrap max-w-none",
              lang === "id"
                ? "text-[clamp(34px,5.2vw,48px)]"
                : "text-[clamp(34px,5.8vw,52px)]"
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
          <p className="mt-2 text-[clamp(14px,1.6vw,18px)] text-slate-600 md:whitespace-nowrap [text-wrap:balance] max-w-none">
            {translations.marketplace.hero.description}
          </p>
        </div>
      </Container>
    </section>
  );
}
