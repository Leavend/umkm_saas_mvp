// src/components/CustomerPortalRedirect.tsx

"use client";

import { useTranslations } from "~/components/language-provider";

export default function CustomerPortalRedirect() {
  const translations = useTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">
        {translations.common.actions.customerPortal}
      </h1>
      <p className="text-muted-foreground max-w-md text-sm">
        Billing portal is currently unavailable. Please contact support for
        assistance with your subscription or credit purchases.
      </p>
    </div>
  );
}
