// src/components/marketplace/marketplace-hero.tsx

import { useTranslations } from "~/components/language-provider";

export function MarketplaceHero() {
  const translations = useTranslations();

  return (
    <section className="pt-10 pb-6 md:pt-8 md:pb-4">
      <div className="container-tight">
        <div className="text-center">
          <h1 className="mx-auto max-w-[18ch] text-4xl leading-tight font-extrabold tracking-tight text-slate-800 md:text-5xl">
            {translations.marketplace.hero.titleLeading}{" "}
            <span className="text-brand-700 font-semibold">
              {translations.marketplace.hero.titleHighlight}
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-[60ch] text-sm text-neutral-600 md:text-base">
            {translations.marketplace.hero.description}
          </p>
        </div>
      </div>
    </section>
  );
}
