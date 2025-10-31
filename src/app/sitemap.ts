import type { MetadataRoute } from "next";
import { SUPPORTED_LOCALES } from "~/lib/i18n";
import { PLACEHOLDER_PROMPTS } from "~/lib/placeholder-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Generate URLs for each locale
  const localeUrls = SUPPORTED_LOCALES.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
  ]);

  // Generate URLs for individual prompts
  const promptUrls = SUPPORTED_LOCALES.flatMap((locale) =>
    PLACEHOLDER_PROMPTS.map((prompt) => ({
      url: `${baseUrl}/${locale}/${prompt.id}`,
      lastModified: prompt.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  return [...localeUrls, ...promptUrls];
}
