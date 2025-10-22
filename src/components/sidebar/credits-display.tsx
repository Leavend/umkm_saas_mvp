// src/components/sidebar/credits-display.tsx

"use client";

import { Coins, Sparkles } from "lucide-react";

import { useTranslations } from "~/components/language-provider";

export function CreditsDisplay({ credits }: { credits: number | null }) {
  const translations = useTranslations();
  const label = translations.sidebar.footer.credits;

  return (
    <div className="group flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Coins className="h-4 w-4 text-yellow-500 transition-colors duration-200 group-hover:text-yellow-400" />
          <Sparkles className="absolute -top-1 -right-1 h-2 w-2 text-yellow-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>
        <div className="flex flex-col">
          <span className="text-foreground text-sm font-bold transition-colors duration-200 group-hover:text-yellow-600">
            {credits ?? 0}
          </span>
          <span className="text-muted-foreground text-xs leading-tight">{label}</span>
        </div>
      </div>
    </div>
  );
}
