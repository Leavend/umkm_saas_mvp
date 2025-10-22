// src/lib/content/blog-posts.ts

import type { Locale } from "../i18n/locales";
import type { LocalizedSlugRecord } from "../i18n/slug";

export interface BlogPost extends LocalizedSlugRecord {
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  body: Record<Locale, string>;
  publishedAt: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "ai-product-photography",
    slug_en: "ai-product-photography",
    slug_id: "fotografi-produk-ai",
    title: {
      en: "How AI Levels Up Your Product Photography",
      id: "Bagaimana AI Mengangkat Fotografi Produk Anda",
    },
    excerpt: {
      en: "Simple tactics to automate retouching and background removal for SME catalogues.",
      id: "Taktik sederhana untuk mengotomatiskan retouching dan penghapusan latar untuk katalog UMKM.",
    },
    body: {
      en: "Leverage AI pipelines to retouch, relight, and background swap your product catalogue within minutes.",
      id: "Manfaatkan pipeline AI untuk retouch, pencahayaan ulang, dan mengganti latar katalog produk Anda dalam hitungan menit.",
    },
    publishedAt: "2024-12-10",
  },
  {
    id: "optimize-marketplace-conversions",
    slug_en: "optimize-marketplace-conversions",
    slug_id: "optimalkan-konversi-marketplace",
    title: {
      en: "Optimize Marketplace Conversion with Consistent Imagery",
      id: "Optimalkan Konversi Marketplace dengan Visual Konsisten",
    },
    excerpt: {
      en: "Why consistent background colors and crisp crops boost add-to-cart rates.",
      id: "Mengapa latar konsisten dan cropping tajam meningkatkan rasio tambah keranjang.",
    },
    body: {
      en: "Consistent visuals build trust. Use AI templating to keep every listing on-brand across Bahasa Indonesia and English storefronts.",
      id: "Visual konsisten membangun kepercayaan. Gunakan templat AI agar setiap listing tetap sesuai brand di etalase Bahasa Indonesia dan Inggris.",
    },
    publishedAt: "2024-11-02",
  },
];

export function listBlogPosts() {
  return blogPosts;
}

export function getBlogPostBySlug(locale: Locale, slug: string) {
  return blogPosts.find((post) => post[locale === "id" ? "slug_id" : "slug_en"] === slug) ?? null;
}
