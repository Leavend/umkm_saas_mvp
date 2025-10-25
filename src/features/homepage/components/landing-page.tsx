// src/features/homepage/components/landing-page.tsx

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  ImageIcon,
  Play,
  Sparkles,
  Star,
} from "lucide-react";

import { LanguageToggle } from "~/components/language-toggle";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

import type { HomePageContent } from "../content-builder";

const STAR_COUNT = 5;

type Content = HomePageContent;

interface LandingPageProps {
  content: Content;
  lang: string;
}
export const LandingPage = ({ content, lang }: LandingPageProps) => {
  const {
    brandName,
    navLinks,
    actions,
    hero,
    features,
    howItWorks,
    testimonials,
    pricing,
    cta,
    footer,
  } = content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      <LandingNavigation
        brandName={brandName}
        navLinks={navLinks}
        actions={actions}
        lang={lang}
      />
      <div className="border-b border-slate-200 bg-slate-50/95 px-4 py-3 md:hidden">
        <LanguageToggle className="w-full justify-center" />
      </div>

      <HeroSection hero={hero} lang={lang} />
      <FeaturesSection features={features} />
      <HowItWorksSection howItWorks={howItWorks} />
      <TestimonialsSection testimonials={testimonials} />
      <PricingSection pricing={pricing} lang={lang} />
      <CtaSection cta={cta} lang={lang} />
      <Footer brandName={brandName} footer={footer} lang={lang} />
    </div>
  );
};

interface LandingNavigationProps {
  brandName: string;
  navLinks: Content["navLinks"];
  actions: Content["actions"];
  lang: string;
}

const LandingNavigation = ({
  brandName,
  navLinks,
  actions,
  lang,
}: LandingNavigationProps) => (
  <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
          {brandName}
        </span>
      </div>

      <div className="hidden items-center space-x-6 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-slate-600 transition-colors hover:text-blue-600"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <LanguageToggle className="hidden md:inline-flex" />
        {/* ----- Perubahan 6: Gunakan `lang` pada href Sign In ----- */}
        <Link href={`/${lang}/auth/sign-in`}>
          <Button variant="ghost" size="sm" className="cursor-pointer">
            {actions.signIn}
          </Button>
        </Link>
        {/* ----- Perubahan 7: Gunakan `lang` pada href Try Free (Dashboard) ----- */}
        <Link href={`/${lang}/dashboard`}>
          <Button size="sm" className="cursor-pointer gap-2">
            {actions.tryFree}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  </nav>
);

interface HeroSectionProps {
  hero: Content["hero"];
  lang: String;
}

const HeroSection = ({ hero, lang }: HeroSectionProps) => (
  <section className="relative overflow-hidden py-20 sm:py-32">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-100/30 px-4 py-2 text-sm">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-700">{hero.badge}</span>
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-800 sm:text-6xl">
          {hero.titleLeading}{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {hero.titleHighlight}
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 sm:text-xl">
          {hero.description}
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href={`/${lang}/dashboard`}>
            <Button
              size="lg"
              className="cursor-pointer gap-2 px-8 py-6 text-base"
            >
              <Play className="h-5 w-5" />
              {hero.primaryCta}
            </Button>
          </Link>
          <Link href={`/${lang}/dashboard`}>
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer gap-2 px-8 py-6 text-base"
            >
              <ImageIcon className="h-5 w-5" />
              {hero.secondaryCta}
            </Button>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <p className="mb-8 text-sm text-slate-500">{hero.trustedBy}</p>
          <div className="grid grid-cols-2 items-center justify-center gap-6 opacity-80 sm:grid-cols-5">
            {hero.metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-2xl font-bold text-slate-700">
                  {metric.value}
                </div>
                <div className="text-xs text-slate-500">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

interface FeaturesSectionProps {
  features: Content["features"];
}

const FeaturesSection = ({ features }: FeaturesSectionProps) => (
  <section id="features" className="bg-white py-20 sm:py-32">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          {features.headingLeading}{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {features.headingHighlight}
          </span>
        </h2>
        <p className="mt-4 text-lg text-slate-600">{features.description}</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.items.map((feature) => (
          <Card
            key={feature.key}
            className="group relative overflow-hidden border-slate-200 bg-white/70 backdrop-blur-sm transition-all hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div
                className={`${feature.iconBackgroundClass} ${feature.iconColorClass} mb-4 inline-flex items-center justify-center rounded-lg p-3`}
              >
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
          </Card>
        ))}
      </div>
    </div>
  </section>
);

interface HowItWorksSectionProps {
  howItWorks: Content["howItWorks"];
}

const HowItWorksSection = ({ howItWorks }: HowItWorksSectionProps) => (
  <section className="bg-slate-50 py-20 sm:py-32">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          {howItWorks.heading}
        </h2>
        <p className="mt-4 text-lg text-slate-600">{howItWorks.description}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {howItWorks.steps.map((step) => (
          <div key={step.title} className="relative">
            <div className="mb-4 flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-lg font-bold text-white shadow-lg">
                {step.step}
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-800">
              {step.title}
            </h3>
            <p className="text-slate-600">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

interface TestimonialsSectionProps {
  testimonials: Content["testimonials"];
}

const TestimonialsSection = ({ testimonials }: TestimonialsSectionProps) => (
  <section id="testimonials" className="bg-white py-20 sm:py-32">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          {testimonials.headingLeading}{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {testimonials.headingHighlight}
          </span>
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          {testimonials.description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.items.map((testimonial) => (
          <Card
            key={testimonial.name}
            className="relative border-slate-200 bg-white/70 backdrop-blur-sm"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: STAR_COUNT }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mb-4 text-slate-600 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-slate-800">
                  {testimonial.name}
                </div>
                <div className="text-sm text-slate-500">{testimonial.role}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

interface PricingSectionProps {
  pricing: Content["pricing"];
  lang: String;
}

const PricingSection = ({ pricing, lang }: PricingSectionProps) => (
  <section
    id="pricing"
    className="bg-gradient-to-br from-slate-50 to-blue-50/50 py-20 sm:py-32"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          {pricing.headingLeading}{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {pricing.headingHighlight}
          </span>
        </h2>
        <p className="mt-4 text-lg text-slate-600">{pricing.description}</p>
      </div>

      <div className="mx-auto max-w-lg">
        <Card className="relative overflow-hidden border-2 border-blue-300 bg-white/70 backdrop-blur-sm">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-1 text-sm font-medium text-white">
            {pricing.badge}
          </div>
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-slate-800">
                {pricing.planName}
              </h3>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-5xl font-bold text-slate-800">
                  {pricing.price}
                </span>
                <span className="ml-2 text-slate-600">
                  {pricing.priceSuffix}
                </span>
              </div>
              <p className="mt-2 text-slate-600">{pricing.subheading}</p>
            </div>

            <ul className="mb-8 space-y-4">
              {pricing.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href={`/${lang}/dashboard`}>
              <Button
                className="w-full cursor-pointer gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                {pricing.ctaLabel}
              </Button>
            </Link>

            <p className="mt-4 text-center text-xs text-slate-500">
              {pricing.footnote}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

interface CtaSectionProps {
  cta: Content["cta"];
  lang: String;
}

const CtaSection = ({ cta, lang }: CtaSectionProps) => (
  <section className="bg-gradient-to-r from-blue-100/70 to-purple-100/70 py-20 sm:py-32">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          {cta.heading}
        </h2>
        <p className="mt-4 text-lg text-slate-600">{cta.description}</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href={`/${lang}/dashboard`}>
            <Button
              size="lg"
              className="cursor-pointer gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-base hover:from-blue-600 hover:to-purple-700"
            >
              <Sparkles className="h-5 w-5" />
              {cta.primaryCta}
            </Button>
          </Link>
          <Link href={`/${lang}/dashboard`}>
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer gap-2 border-slate-300 px-8 py-6 text-base text-slate-700 hover:bg-slate-100"
            >
              <Download className="h-5 w-5" />
              {cta.secondaryCta}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

interface FooterProps {
  brandName: string;
  footer: Content["footer"];
  lang: String;
}

const Footer = ({ brandName, footer, lang }: FooterProps) => (
  <footer className="border-t border-slate-200 bg-slate-100">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                {brandName}
              </span>
            </div>
            <p className="max-w-md text-slate-600">{footer.description}</p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-800">
              {footer.product.title}
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link
                  href="#features"
                  className="transition-colors hover:text-blue-600"
                >
                  {footer.product.links.features}
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="transition-colors hover:text-blue-600"
                >
                  {footer.product.links.pricing}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/dashboard`}
                  className="transition-colors hover:text-blue-600"
                >
                  {footer.product.links.dashboard}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-800">
              {footer.support.title}
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-blue-600"
                >
                  {footer.support.links.helpCenter}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-blue-600"
                >
                  {footer.support.links.contact}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-blue-600"
                >
                  {footer.support.links.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p>
            &copy; 2025 {brandName}. {footer.copyright}
          </p>
        </div>
      </div>
    </div>
  </footer>
);
