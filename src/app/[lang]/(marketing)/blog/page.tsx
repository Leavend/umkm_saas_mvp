// src/app/[lang]/(marketing)/blog/page.tsx

import type { Metadata } from "next";

import { Card, CardContent } from "~/components/ui/card";
import { listBlogPosts } from "~/lib/content/blog-posts";
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
    locales.map((locale) => [locale, localizedHref(locale, "/blog")]),
  );

  return {
    title: "Blog | AI Image Editor",
    description:
      "Learn how SMEs automate catalogue production, increase conversions, and streamline visual workflows with AI-powered editing.",
    alternates: {
      canonical: localizedHref(lang, "/blog"),
      languages,
    },
  } satisfies Metadata;
}

export default async function BlogPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const locale = lang;
  const posts = listBlogPosts().map((post) => ({
    id: post.id,
    title: post.title[locale],
    excerpt: post.excerpt[locale],
    slug: pickSlug(post, locale),
    date: new Date(post.publishedAt),
  }));

  const heading =
    locale === "id"
      ? {
          title: "Wawasan untuk UMKM",
          description:
            "Strategi praktis memanfaatkan AI untuk mempercepat produksi konten dan meningkatkan penjualan.",
        }
      : {
          title: "Insights for Small Businesses",
          description:
            "Practical strategies to leverage AI for faster content production and better conversion rates.",
        };

  return (
    <main className="bg-gradient-to-br from-slate-50 via-blue-50/20 to-white py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {heading.title}
          </h1>
          <p className="mt-4 text-lg text-slate-600 sm:text-xl">{heading.description}</p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.id} className="border border-slate-200/60 bg-white/80 backdrop-blur">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-blue-500">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                    }).format(post.date)}
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">{post.title}</h2>
                  <p className="text-sm text-slate-600">{post.excerpt}</p>
                </div>
                <div className="mt-6">
                  <Link
                    locale={locale}
                    href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                  >
                    {locale === "id" ? "Baca selengkapnya" : "Read more"}
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
