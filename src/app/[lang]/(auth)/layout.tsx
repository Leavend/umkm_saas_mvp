// src/app/[lang]/(auth)/layout.tsx

import type { ReactNode } from "react";
import { ImageIcon, Sparkles, Target, Zap } from "lucide-react";
import Link from "next/link";

import type { MetricKey } from "~/features/homepage/content-builder";
import { getDictionary } from "~/lib/dictionary";
import { SUPPORTED_LOCALES, assertValidLocale } from "~/lib/i18n";
import { fetchHomePageMetricValues } from "~/server/services/homepage-metrics-service";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  assertValidLocale(lang);

  const dict = getDictionary(lang);
  const { auth, common, home } = dict;

  const metricValues = await fetchHomePageMetricValues(lang);

  const fallbackMetricMap = home.metrics.reduce<Record<MetricKey, string>>(
    (acc, metric) => {
      acc[metric.key] = metric.fallbackValue;
      return acc;
    },
    {} as Record<MetricKey, string>,
  );

  const getMetricValue = (key: MetricKey) =>
    metricValues[key] ?? fallbackMetricMap[key];

  const featureList = [
    {
      icon: ImageIcon,
      text: auth.features.background,
      color: "bg-emerald-500/20 border-emerald-400/30 text-emerald-300",
    },
    {
      icon: Zap,
      text: auth.features.speed,
      color: "bg-amber-500/20 border-amber-400/30 text-amber-300",
    },
    {
      icon: Target,
      text: auth.features.quality,
      color: "bg-purple-500/20 border-purple-400/30 text-purple-300",
    },
  ] as const;

  const stats = [
    { value: getMetricValue("imagesProcessed"), label: auth.stats.images },
    { value: getMetricValue("activeUsers"), label: auth.stats.users },
    { value: getMetricValue("userRating"), label: auth.stats.rating },
  ];

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 lg:flex lg:w-1/2">
        <div className="bg-grid-white/[0.1] absolute inset-0 bg-[size:30px_30px]" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className="mb-12 flex items-center justify-between gap-3">
            <Link href={`/${lang}`} className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/20 backdrop-blur-sm">
                <Sparkles className="h-7 w-7 text-blue-300" />
              </div>
              <span className="text-2xl font-bold text-blue-50">
                {common.brand.name}
              </span>
            </Link>
          </div>

          <div className="max-w-md">
            <h1 className="mb-6 text-4xl leading-tight font-bold text-blue-50 xl:text-5xl">
              {auth.hero.titleLeading}{" "}
              <span className="text-blue-200">{auth.hero.titleHighlight}</span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-blue-100/90">
              {auth.hero.description}
            </p>

            <div className="space-y-4">
              {featureList.map((feature) => (
                <div key={feature.text} className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border backdrop-blur-sm ${feature.color}`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-blue-100">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-blue-200">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-300/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-20 right-20 h-32 w-32 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute right-32 bottom-20 h-24 w-24 rounded-full bg-purple-400/15 blur-2xl" />
        <div className="absolute top-1/2 right-10 h-16 w-16 rounded-full bg-emerald-400/20 blur-xl" />
      </div>

      <div className="flex flex-1 flex-col justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-6 py-12 lg:px-8">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <Link href={`/${lang}`} className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              {auth.mobileBrand}
            </span>
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div>{children}</div>
          <p className="mt-6 text-center text-sm text-slate-600">
            {auth.backToHomePrefix}{" "}
            <Link
              href={`/${lang}`}
              className="font-medium text-blue-600 transition-colors hover:text-blue-500"
            >
              {common.actions.backToHomepage}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
