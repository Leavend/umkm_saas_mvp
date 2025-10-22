// src/app/[lang]/(marketing)/products/[slug]/page.tsx

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { listProducts } from "~/lib/content/products";
import type { Product } from "~/lib/content/products";
import type { Locale } from "~/lib/i18n";
import { locales } from "~/lib/i18n/locales";
import { Link, localizedHref } from "~/lib/i18n/navigation";
import { getLocalizedRecord, listLocalizedSlugs, resolveLocalizedSlug } from "~/lib/i18n/slug-resolver";
import { pickSlug } from "~/lib/i18n/slug";

export async function generateStaticParams({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  const slugs = listLocalizedSlugs("/products/[slug]", lang);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string };
}): Promise<Metadata> {
  const { lang, slug } = params;
  const record = getLocalizedRecord<Product>("/products/[slug]", lang, slug);

  if (!record) {
    return {
      title: "Products | AI Image Editor",
      description: "AI tooling to remove backgrounds, upscale images, and optimise catalogue workflows.",
    } satisfies Metadata;
  }

  const languages = Object.fromEntries(
    locales.map((locale) => {
      const localizedSlug = resolveLocalizedSlug("/products/[slug]", slug, lang, locale);
      return [
        locale,
        localizedHref(locale, { pathname: "/products/[slug]", params: { slug: localizedSlug } }),
      ];
    }),
  );

  return {
    title: record.name[lang],
    description: record.excerpt[lang],
    alternates: {
      canonical: localizedHref(lang, { pathname: "/products/[slug]", params: { slug } }),
      languages,
    },
  } satisfies Metadata;
}

export default async function ProductPage({
  params,
}: {
  params: { lang: Locale; slug: string };
}) {
  const { lang, slug } = params;
  const product = getLocalizedRecord<Product>("/products/[slug]", lang, slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = listProducts().filter((item) => item.id !== product.id);

  return (
    <main className="bg-gradient-to-br from-white via-blue-50/20 to-slate-50 py-24">
      <article className="mx-auto flex max-w-5xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <header className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-center">
          <div className="relative h-72 w-full overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={product.image}
              alt={product.name[lang]}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 480px"
            />
          </div>
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
              {lang === "id" ? "Fitur unggulan" : "Featured tool"}
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {product.name[lang]}
            </h1>
            <p className="text-lg text-slate-600">{product.description[lang]}</p>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-semibold text-slate-900">{product.price}</span>
              <Link locale={lang} href="/dashboard" className="font-semibold text-blue-600 hover:text-blue-500">
                {lang === "id" ? "Coba sekarang" : "Try it now"}
              </Link>
            </div>
          </div>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            {lang === "id" ? "Manfaat utama" : "Key benefits"}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            <li className="rounded-lg border border-slate-200/60 bg-white/80 p-4 text-sm text-slate-600">
              {lang === "id"
                ? "Simpan preset untuk seluruh katalog dan terapkan dalam sekali klik."
                : "Save presets for entire catalogues and apply them with a single click."}
            </li>
            <li className="rounded-lg border border-slate-200/60 bg-white/80 p-4 text-sm text-slate-600">
              {lang === "id"
                ? "Integrasi langsung dengan marketplace populer di Indonesia."
                : "Direct integrations with leading Southeast Asian marketplaces."}
            </li>
            <li className="rounded-lg border border-slate-200/60 bg-white/80 p-4 text-sm text-slate-600">
              {lang === "id"
                ? "Kontrol batch processing untuk tim dengan volume tinggi."
                : "Batch processing controls built for high-volume teams."}
            </li>
            <li className="rounded-lg border border-slate-200/60 bg-white/80 p-4 text-sm text-slate-600">
              {lang === "id"
                ? "Template multi-bahasa agar katalog siap pakai di pasar global."
                : "Multi-language templates to launch catalogues globally."}
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            {lang === "id" ? "Produk terkait" : "Related products"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedProducts.slice(0, 2).map((item) => {
              const relatedSlug = pickSlug(item, lang);
              return (
                <div key={item.id} className="rounded-lg border border-slate-200/60 bg-white/80 p-4">
                  <h3 className="text-base font-semibold text-slate-900">{item.name[lang]}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.excerpt[lang]}</p>
                  <Link
                    locale={lang}
                    href={{ pathname: "/products/[slug]", params: { slug: relatedSlug } }}
                    className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-500"
                  >
                    {lang === "id" ? "Lihat produk" : "View product"}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </article>
    </main>
  );
}
