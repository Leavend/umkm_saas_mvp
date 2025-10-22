// src/lib/content/products.ts

import type { Locale } from "../i18n/locales";
import type { LocalizedSlugRecord } from "../i18n/slug";

export interface Product extends LocalizedSlugRecord {
  name: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  description: Record<Locale, string>;
  price: string;
  image: string;
}

export const products: Product[] = [
  {
    id: "background-removal",
    slug_en: "background-removal",
    slug_id: "hapus-latar",
    name: {
      en: "AI Background Removal",
      id: "Penghapus Latar AI",
    },
    excerpt: {
      en: "Remove any background in seconds with clean edges and instant previews.",
      id: "Hapus latar belakang dalam hitungan detik dengan tepian rapi dan pratinjau instan.",
    },
    description: {
      en: "Our AI isolates subjects with pixel-perfect precision, giving you production ready transparent PNGs in seconds.",
      id: "AI kami mengisolasi objek dengan presisi piksel sehingga Anda mendapatkan PNG transparan siap produksi hanya dalam detik.",
    },
    price: "$12/mo",
    image: "/images/products/background-removal.svg",
  },
  {
    id: "upscaler",
    slug_en: "ai-upscaler",
    slug_id: "peningkat-kualitas",
    name: {
      en: "AI Upscaler",
      id: "Peningkat Kualitas AI",
    },
    excerpt: {
      en: "Increase image resolution up to 4× without losing detail.",
      id: "Naikkan resolusi gambar hingga 4× tanpa kehilangan detail.",
    },
    description: {
      en: "Enhance low resolution photos for marketplaces and campaigns using our super resolution model trained on 5M product shots.",
      id: "Tingkatkan foto beresolusi rendah untuk marketplace dan kampanye dengan model super resolution kami yang dilatih dari 5 juta foto produk.",
    },
    price: "$19/mo",
    image: "/images/products/upscaler.svg",
  },
];

export function listProducts() {
  return products;
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id) ?? null;
}

export function getProductBySlug(locale: Locale, slug: string) {
  return products.find((product) => product[locale === "id" ? "slug_id" : "slug_en"] === slug) ?? null;
}
