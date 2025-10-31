// src/components/marketplace/marketplace-prompts.tsx

import { Search } from "lucide-react";
import { PromptCard } from "~/components/prompt-card";
import { useTranslations } from "~/components/language-provider";
import type { Prompt } from "@prisma/client";

interface MarketplacePromptsProps {
  prompts: Prompt[];
  onCreditsUpdate: (credits: number) => void;
  onShowAuthModal: () => void;
}

export function MarketplacePrompts({
  prompts,
  onCreditsUpdate,
  onShowAuthModal,
}: MarketplacePromptsProps) {
  const translations = useTranslations();

  if (prompts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Search className="h-8 w-8 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-500 md:text-base">
            {translations.marketplace.noPromptsFound}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onCreditsUpdate={onCreditsUpdate}
          onShowAuthModal={onShowAuthModal}
        />
      ))}
    </div>
  );
}
