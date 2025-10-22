// src/app/[lang]/(marketing)/page.tsx

import {
  ArrowRight,
  CheckCircle2,
  Download,
  Expand,
  ImageIcon,
  Play,
  Scissors,
  Sparkles,
  Star,
  Target,
  Zap,
} from "lucide-react";

import { LanguageToggle } from "~/components/language-toggle";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import type { Locale, Translations } from "~/lib/i18n";
import { getDictionary } from "~/lib/dictionary";
import { Link } from "~/lib/i18n/navigation";

const FEATURE_CONFIGS = [
  {
    key: "backgroundRemoval" as const,
    icon: Scissors,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    key: "upscale" as const,
    icon: Expand,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    key: "objectCrop" as const,
    icon: Target,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    key: "performance" as const,
    icon: Zap,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
] satisfies ReadonlyArray<{
  key: keyof Translations["home"]["features"]["items"];
  icon: typeof Scissors;
  color: string;
  bgColor: string;
}>;

export default async function HomePage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const locale = lang;
  const dict = await getDictionary(locale);
  const { home, common } = dict;

  const featureItems = FEATURE_CONFIGS.map((feature) => ({
    ...feature,
    copy: home.features.items[feature.key],
  }));

  const navLinks = [
    { href: "#features", label: home.nav.features },
    { href: "#pricing", label: home.nav.pricing },
    { href: "#testimonials", label: home.nav.reviews },
  ];

  const howItWorksSteps = [
    home.howItWorks.steps.upload,
    home.howItWorks.steps.choose,
    home.howItWorks.steps.download,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              {common.brand.name}
            </span>
          </div>

          <div className="hidden items-center space-x-6 md:flex">
            {navLinks.map((link) => (
              <Link
                locale={locale}
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
            <Link locale={locale} href="/auth/sign-in">
              <Button variant="ghost" size="sm" className="cursor-pointer">
                {common.actions.signIn}
              </Button>
            </Link>
            <Link locale={locale} href="/dashboard">
              <Button size="sm" className="cursor-pointer gap-2">
                {common.actions.tryFree}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      <div className="border-b border-slate-200 bg-slate-50/95 px-4 py-3 md:hidden">
        <LanguageToggle className="w-full justify-center" />
      </div>

      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-100/30 px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-700">{home.hero.badge}</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-800 sm:text-6xl">
              {home.hero.titleLeading}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {home.hero.titleHighlight}
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 sm:text-xl">
              {home.hero.description}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link locale={locale} href="/dashboard">
                <Button size="lg" className="cursor-pointer gap-2 px-8 py-6 text-base">
                  <Play className="h-5 w-5" />
                  {home.hero.primaryCta}
                </Button>
              </Link>
              <Link locale={locale} href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="cursor-pointer gap-2 px-8 py-6 text-base"
                >
                  <ImageIcon className="h-5 w-5" />
                  {home.hero.secondaryCta}
                </Button>
              </Link>
            </div>

            <div className="mt-16 text-center">
              <p className="mb-8 text-sm text-slate-500">{home.hero.trustedBy}</p>
              <div className="grid grid-cols-2 items-center justify-center gap-6 opacity-80 sm:grid-cols-5">
                {home.metrics.map((metric) => (
                  <div key={metric.label} className="text-center">
                    <div className="text-2xl font-bold text-slate-700">{metric.value}</div>
                    <div className="text-xs text-slate-500">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              {home.features.headingLeading}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {home.features.headingHighlight}
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">{home.features.description}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featureItems.map((feature) => (
              <Card
                key={feature.key}
                className="group relative overflow-hidden border-slate-200 bg-white/70 backdrop-blur-sm transition-all hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div
                    className={`${feature.bgColor} ${feature.color} mb-4 inline-flex items-center justify-center rounded-lg p-3`}
                  >
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-800">
                    {feature.copy.title}
                  </h3>
                  <p className="text-sm text-slate-600">{feature.copy.description}</p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              {home.howItWorks.heading}
            </h2>
            <p className="mt-4 text-lg text-slate-600">{home.howItWorks.description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorksSteps.map((step) => (
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

      <section id="testimonials" className="bg-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              {home.testimonials.headingLeading}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {home.testimonials.headingHighlight}
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">{home.testimonials.description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {home.testimonials.items.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="relative border-slate-200 bg-white/70 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
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

      <section id="pricing" className="bg-gradient-to-br from-slate-50 to-blue-50/50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              {home.pricing.headingLeading}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {home.pricing.headingHighlight}
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">{home.pricing.description}</p>
          </div>

          <div className="mx-auto max-w-lg">
            <Card className="relative overflow-hidden border-2 border-blue-300 bg-white/70 backdrop-blur-sm">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-1 text-sm font-medium text-white">
                {home.pricing.badge}
              </div>
              <CardContent className="p-8">
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {home.pricing.planName}
                  </h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-slate-800">
                      {home.pricing.price}
                    </span>
                    <span className="ml-2 text-slate-600">
                      {home.pricing.priceSuffix}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-600">{home.pricing.subheading}</p>
                </div>

                <ul className="mb-8 space-y-4">
                  {home.pricing.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link locale={locale} href="/dashboard">
                  <Button className="w-full cursor-pointer gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" size="lg">
                    <Sparkles className="h-4 w-4" />
                    {home.hero.primaryCta}
                  </Button>
                </Link>

                <p className="mt-4 text-center text-xs text-slate-500">
                  {home.pricing.footnote}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-100/70 to-purple-100/70 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              {home.cta.heading}
            </h2>
            <p className="mt-4 text-lg text-slate-600">{home.cta.description}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link locale={locale} href="/dashboard">
                <Button
                  size="lg"
                  className="cursor-pointer gap-2 bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-base hover:from-blue-600 hover:to-purple-700"
                >
                  <Sparkles className="h-5 w-5" />
                  {home.cta.primaryCta}
                </Button>
              </Link>
              <Link locale={locale} href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="cursor-pointer gap-2 border-slate-300 px-8 py-6 text-base text-slate-700 hover:bg-slate-100"
                >
                  <Download className="h-5 w-5" />
                  {home.cta.secondaryCta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
                    {common.brand.name}
                  </span>
                </div>
                <p className="max-w-md text-slate-600">{home.footer.description}</p>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-slate-800">
                  {home.footer.product.title}
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>
                    <Link
                      locale={locale}
                      href="#features"
                      className="transition-colors hover:text-blue-600"
                    >
                      {home.footer.product.links.features}
                    </Link>
                  </li>
                  <li>
                    <Link
                      locale={locale}
                      href="#pricing"
                      className="transition-colors hover:text-blue-600"
                    >
                      {home.footer.product.links.pricing}
                    </Link>
                  </li>
                  <li>
                    <Link
                      locale={locale}
                      href="/dashboard"
                      className="transition-colors hover:text-blue-600"
                    >
                      {home.footer.product.links.dashboard}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-semibold text-slate-800">
                  {home.footer.support.title}
                </h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li>
                    <Link
                      locale={locale}
                      href="#"
                      className="transition-colors hover:text-blue-600"
                    >
                      {home.footer.support.links.helpCenter}
                    </Link>
                  </li>
                  <li>
                    <Link
                      locale={locale}
                      href="#"
                      className="transition-colors hover:text-blue-600"
                    >
                      {home.footer.support.links.contact}
                    </Link>
                  </li>
                  <li>
                    <Link
                      locale={locale}
                      href="#"
                      className="transition-colors hover:text-blue-600"
                    >
                      {home.footer.support.links.privacy}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-16 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
              <p>&copy; 2025 {common.brand.name}. {home.footer.copyright}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}