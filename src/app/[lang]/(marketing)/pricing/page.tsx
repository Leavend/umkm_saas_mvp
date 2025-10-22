// src/app/[lang]/(marketing)/pricing/page.tsx

import type { Metadata } from "next";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { getDictionary } from "~/lib/dictionary";
import type { Locale } from "~/lib/i18n";
import { locales } from "~/lib/i18n/locales";
import { Link, localizedHref } from "~/lib/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const { lang } = params;
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, localizedHref(locale, "/pricing")]),
  );

  return {
    title: "Pricing | AI Image Editor",
    description:
      "Flexible pricing for growing small businesses that need fast, accurate AI-powered image editing.",
    alternates: {
      canonical: localizedHref(lang, "/pricing"),
      languages,
    },
  } satisfies Metadata;
}

export default async function PricingPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const locale = lang;
  const dict = await getDictionary(locale);
  const { home } = dict;

  return (
    <main className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-white py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {home.pricing.headingLeading}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {home.pricing.headingHighlight}
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 sm:text-xl">
            {home.pricing.description}
          </p>
        </section>

        <section className="grid gap-8 lg:grid-cols-[2fr_3fr]">
          <Card className="border-2 border-blue-200/70 bg-white/80 backdrop-blur">
            <CardContent className="p-8">
              <div className="mb-8 text-center">
                <span className="mb-3 inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
                  {home.pricing.badge}
                </span>
                <h2 className="text-3xl font-semibold text-slate-800">
                  {home.pricing.planName}
                </h2>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-slate-900">
                    {home.pricing.price}
                  </span>
                  <span className="text-slate-500">{home.pricing.priceSuffix}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{home.pricing.subheading}</p>
              </div>

              <ul className="space-y-4 text-sm text-slate-700">
                {home.pricing.features.map((feature) => (
                  <li key={feature} className="rounded-lg border border-slate-200/60 bg-slate-50/60 px-4 py-3">
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3">
                <Link locale={locale} href="/dashboard">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-base font-semibold text-white shadow-lg hover:from-blue-600 hover:to-purple-700">
                    {home.hero.primaryCta}
                  </Button>
                </Link>
                <p className="text-center text-xs text-slate-500">
                  {home.pricing.footnote}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                {locale === "id" ? "Semua yang Anda dapatkan" : "Everything you get"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {locale === "id"
                  ? "Langganan tunggal yang mencakup seluruh fitur editor gambar AI kami."
                  : "A single subscription that unlocks every capability of our AI image editor."}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {home.features.items.backgroundRemoval.title && (
                  <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-4">
                    <h3 className="font-semibold text-slate-800">
                      {home.features.items.backgroundRemoval.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {home.features.items.backgroundRemoval.description}
                    </p>
                  </div>
                )}
                {home.features.items.upscale.title && (
                  <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-4">
                    <h3 className="font-semibold text-slate-800">
                      {home.features.items.upscale.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {home.features.items.upscale.description}
                    </p>
                  </div>
                )}
                {home.features.items.objectCrop.title && (
                  <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-4">
                    <h3 className="font-semibold text-slate-800">
                      {home.features.items.objectCrop.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {home.features.items.objectCrop.description}
                    </p>
                  </div>
                )}
                {home.features.items.performance.title && (
                  <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-4">
                    <h3 className="font-semibold text-slate-800">
                      {home.features.items.performance.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {home.features.items.performance.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
