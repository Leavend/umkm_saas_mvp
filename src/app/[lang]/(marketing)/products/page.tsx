// src/app/[lang]/(marketing)/products/page.tsx

import type { Metadata } from "next";
import Image from "next/image";

import { Card, CardContent } from "~/components/ui/card";
import { listProducts } from "~/lib/content/products";
import type { Locale } from "~/lib/i18n";
import { locales } from "~/lib/i18n/locales";
import { Link, localizedHref } from "~/lib/i18n/navigation";
import { pickSlug } from "~/lib/i18n/slug";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const { lang } = params;
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, localizedHref(locale, "/products")]),
  );

  return {
    title: "Products | AI Image Editor",
    description:
      "Discover AI-powered tools that remove backgrounds, upscale photos, and prepare catalogue assets in minutes.",
    alternates: {
      canonical: localizedHref(lang, "/products"),
      languages,
    },
  } satisfies Metadata;
}

export default async function ProductsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const locale = lang;
  const products = listProducts().map((product) => ({
    id: product.id,
    name: product.name[locale],
    excerpt: product.excerpt[locale],
    image: product.image,
    slug: pickSlug(product, locale),
    price: product.price,
  }));

  const heading =
    locale === "id"
      ? {
          title: "Solusi AI untuk UMKM",
          description:
            "Automasi penghapusan latar, peningkatan kualitas, dan persiapan katalog hanya dalam hitungan menit.",
        }
      : {
          title: "AI Solutions for SMEs",
          description:
            "Automate background removal, upscaling, and catalogue-ready assets in minutes.",
        };

  return (
    <main className="bg-gradient-to-br from-white via-blue-50/20 to-slate-50 py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {heading.title}
          </h1>
          <p className="mt-4 text-lg text-slate-600 sm:text-xl">{heading.description}</p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="border border-slate-200/60 bg-white/80 backdrop-blur">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="relative h-40 w-full overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 320px"
                  />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
                  <p className="text-sm text-slate-600">{product.excerpt}</p>
                </div>
                <div className="mt-auto flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900">{product.price}</span>
                  <Link
                    locale={locale}
                    href={{ pathname: "/products/[slug]", params: { slug: product.slug } }}
                    className="font-semibold text-blue-600 hover:text-blue-500"
                  >
                    {locale === "id" ? "Lihat detail" : "View details"}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
