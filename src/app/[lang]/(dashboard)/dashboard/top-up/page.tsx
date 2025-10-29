"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import {
  CREDITS_MAP,
  PRODUCT_AMOUNTS,
  PRODUCT_AMOUNTS_USD,
  PRODUCT_IDS,
  PRODUCT_NAMES,
} from "~/lib/constants";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useTranslations } from "~/components/language-provider";
import { useLocale } from "~/hooks/use-locale";

type ProductOption = {
  id: string;
  name: string;
  credits: number;
  amount: number;
};

export default function TopUpPage() {
  const translations = useTranslations();
  const topUpCopy = translations.dashboard.topUp;
  const locale = useLocale();
  const [pendingProduct, setPendingProduct] = useState<string | null>(null);

  const currencyFormatter = useMemo(
    () =>
      locale === "en"
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
        : new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }),
    [locale],
  );

  const productOptions = useMemo<ProductOption[]>(
    () =>
      Object.values(PRODUCT_IDS).map((id) => {
        const credits = CREDITS_MAP[id as keyof typeof CREDITS_MAP] ?? 0;
        const amount =
          locale === "en"
            ? (PRODUCT_AMOUNTS_USD[id as keyof typeof PRODUCT_AMOUNTS_USD] ?? 0)
            : (PRODUCT_AMOUNTS[id as keyof typeof PRODUCT_AMOUNTS] ?? 0);
        const name =
          PRODUCT_NAMES[id as keyof typeof PRODUCT_NAMES] ??
          `${credits} credits`;

        return {
          id,
          name,
          credits,
          amount,
        } satisfies ProductOption;
      }),
    [locale],
  );

  const handlePurchase = async (productId: string) => {
    try {
      setPendingProduct(productId);

      const response = await fetch("/api/xendit/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          currency: locale === "en" ? "USD" : "IDR",
        }),
      });

      if (!response.ok) {
        console.error("Failed to create invoice", await response.text());
        setPendingProduct(null);
        return;
      }

      const data = (await response.json()) as { invoiceUrl?: string };

      if (!data.invoiceUrl) {
        console.error("Missing invoice URL in response");
        setPendingProduct(null);
        return;
      }

      window.location.href = data.invoiceUrl;
    } catch (error) {
      console.error("Top-up request failed", error);
      setPendingProduct(null);
    }
  };

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="space-y-8">
          <header className="space-y-2">
            <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              {topUpCopy.title}
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm">
              {topUpCopy.description}
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-3">
            {productOptions.map((option) => (
              <Card
                key={option.id}
                className="via-background to-background border-orange-400/20 bg-gradient-to-br from-orange-400/5 shadow-sm transition hover:border-orange-400/40 hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-orange-500">
                    <Sparkles className="h-5 w-5" />
                    {option.name}
                  </CardTitle>
                  <CardDescription>
                    {currencyFormatter.format(option.amount)} • {option.credits}{" "}
                    {topUpCopy.creditsSuffix}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {topUpCopy.benefit}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={pendingProduct === option.id}
                    onClick={() => handlePurchase(option.id)}
                  >
                    {pendingProduct === option.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {topUpCopy.processing}
                      </span>
                    ) : (
                      topUpCopy.purchaseCta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </SignedIn>
    </>
  );
}
