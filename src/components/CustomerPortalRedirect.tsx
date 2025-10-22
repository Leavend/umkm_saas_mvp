// src/components/CustomerPortalRedirect.tsx

"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { useTranslations } from "~/components/language-provider";

export default function CustomerPortalRedirect() {
  const translations = useTranslations();
  useEffect(() => {
    const portal = async () => {
      await authClient.customer.portal();
    };
    void portal();
  }, []);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">
          {translations.customerPortal.loading}
        </p>
      </div>
    </div>
  );
}
