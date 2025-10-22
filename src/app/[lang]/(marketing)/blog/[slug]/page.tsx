// src/app/[lang]/(marketing)/blog/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listBlogPosts } from "~/lib/content/blog-posts";
import type { BlogPost } from "~/lib/content/blog-posts";
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
  const slugs = listLocalizedSlugs("/blog/[slug]", lang);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string };
}): Promise<Metadata> {
  const { lang, slug } = params;
  const record = getLocalizedRecord<BlogPost>("/blog/[slug]", lang, slug);

  if (!record) {
    return {
      title: "Blog | AI Image Editor",
      description: "AI automation tips for product photography and marketing teams.",
    } satisfies Metadata;
  }

  const languages = Object.fromEntries(
    locales.map((locale) => {
      const localizedSlug = resolveLocalizedSlug("/blog/[slug]", slug, lang, locale);
      return [
        locale,
        localizedHref(locale, { pathname: "/blog/[slug]", params: { slug: localizedSlug } }),
      ];
    }),
  );

  return {
    title: record.title[lang],
    description: record.excerpt[lang],
    alternates: {
      canonical: localizedHref(lang, { pathname: "/blog/[slug]", params: { slug } }),
      languages,
    },
  } satisfies Metadata;
}

export default async function BlogPostPage({
  params,
}: {
  params: { lang: Locale; slug: string };
}) {
  const { lang, slug } = params;
  const record = getLocalizedRecord<BlogPost>("/blog/[slug]", lang, slug);

  if (!record) {
    notFound();
  }

  const posts = listBlogPosts();
  const otherPosts = posts.filter((post) => post.id !== record.id);

  return (
    <main className="bg-gradient-to-br from-white via-blue-50/20 to-slate-50 py-24">
      <article className="mx-auto flex max-w-3xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-wide text-blue-500">
            {new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(record.publishedAt))}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {record.title[lang]}
          </h1>
          <p className="text-lg text-slate-600">{record.excerpt[lang]}</p>
        </header>

        <div className="prose prose-slate mx-auto max-w-none text-slate-700 prose-headings:text-slate-900">
          <p>{record.body[lang]}</p>
        </div>

        <footer className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {lang === "id" ? "Artikel lainnya" : "More articles"}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {otherPosts.slice(0, 2).map((post) => {
              const otherSlug = pickSlug(post, lang);
              return (
                <li key={post.id} className="rounded-lg border border-slate-200/60 bg-white/80 p-4">
                  <h3 className="text-base font-semibold text-slate-900">{post.title[lang]}</h3>
                  <p className="mt-2 text-sm text-slate-600">{post.excerpt[lang]}</p>
                  <Link
                    locale={lang}
                    href={{ pathname: "/blog/[slug]", params: { slug: otherSlug } }}
                    className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-500"
                  >
                    {lang === "id" ? "Baca artikel" : "Read article"}
                  </Link>
                </li>
              );
            })}
          </ul>
        </footer>
      </article>
    </main>
  );
}
