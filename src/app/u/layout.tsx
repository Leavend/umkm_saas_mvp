import "~/styles/globals.css";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { Providers } from "~/components/providers";
import { DEFAULT_LOCALE } from "~/lib/i18n";

export default function ULayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body>
        <Providers initialLocale={DEFAULT_LOCALE}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
