// src/features/homepage/content-builder.ts

import {
  Expand,
  Scissors,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Translations } from "~/lib/i18n";

export type FeatureKey = keyof Translations["home"]["features"]["items"];

export interface FeatureCardContent {
  key: FeatureKey;
  icon: LucideIcon;
  iconColorClass: string;
  iconBackgroundClass: string;
  title: string;
  description: string;
}

export interface HomePageContent {
  brandName: string;
  navLinks: Array<{ href: string; label: string }>;
  actions: {
    signIn: string;
    tryFree: string;
  };
  hero: {
    badge: string;
    titleLeading: string;
    titleHighlight: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    trustedBy: string;
    metrics: Translations["home"]["metrics"];
  };
  features: {
    headingLeading: string;
    headingHighlight: string;
    description: string;
    items: FeatureCardContent[];
  };
  howItWorks: {
    heading: string;
    description: string;
    steps: Array<
      Translations["home"]["howItWorks"]["steps"][keyof Translations["home"]["howItWorks"]["steps"]]
    >;
  };
  testimonials: Translations["home"]["testimonials"];
  pricing: Translations["home"]["pricing"] & { ctaLabel: string };
  cta: Translations["home"]["cta"];
  footer: Translations["home"]["footer"];
}

const FEATURE_CONFIGS = [
  {
    key: "backgroundRemoval" as const,
    icon: Scissors,
    iconColorClass: "text-emerald-600",
    iconBackgroundClass: "bg-emerald-100",
  },
  {
    key: "upscale" as const,
    icon: Expand,
    iconColorClass: "text-blue-600",
    iconBackgroundClass: "bg-blue-100",
  },
  {
    key: "objectCrop" as const,
    icon: Target,
    iconColorClass: "text-purple-600",
    iconBackgroundClass: "bg-purple-100",
  },
  {
    key: "performance" as const,
    icon: Zap,
    iconColorClass: "text-amber-600",
    iconBackgroundClass: "bg-amber-100",
  },
] satisfies ReadonlyArray<{
  key: FeatureKey;
  icon: LucideIcon;
  iconColorClass: string;
  iconBackgroundClass: string;
}>;

export const buildHomePageContent = (
  translations: Translations,
): HomePageContent => {
  const { home, common } = translations;

  const featureCards: FeatureCardContent[] = FEATURE_CONFIGS.map(
    ({ key, icon, iconColorClass, iconBackgroundClass }) => ({
      key,
      icon,
      iconColorClass,
      iconBackgroundClass,
      title: home.features.items[key].title,
      description: home.features.items[key].description,
    }),
  );

  const howItWorksSteps = [
    home.howItWorks.steps.upload,
    home.howItWorks.steps.choose,
    home.howItWorks.steps.download,
  ];

  return {
    brandName: common.brand.name,
    navLinks: [
      { href: "#features", label: home.nav.features },
      { href: "#pricing", label: home.nav.pricing },
      { href: "#testimonials", label: home.nav.reviews },
    ],
    actions: {
      signIn: common.actions.signIn,
      tryFree: common.actions.tryFree,
    },
    hero: {
      badge: home.hero.badge,
      titleLeading: home.hero.titleLeading,
      titleHighlight: home.hero.titleHighlight,
      description: home.hero.description,
      primaryCta: home.hero.primaryCta,
      secondaryCta: home.hero.secondaryCta,
      trustedBy: home.hero.trustedBy,
      metrics: home.metrics,
    },
    features: {
      headingLeading: home.features.headingLeading,
      headingHighlight: home.features.headingHighlight,
      description: home.features.description,
      items: featureCards,
    },
    howItWorks: {
      heading: home.howItWorks.heading,
      description: home.howItWorks.description,
      steps: howItWorksSteps,
    },
    testimonials: home.testimonials,
    pricing: {
      ...home.pricing,
      ctaLabel: home.hero.primaryCta,
    },
    cta: home.cta,
    footer: home.footer,
  };
};
