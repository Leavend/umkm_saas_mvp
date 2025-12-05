// src/components/marketplace/marketplace-saved.tsx

import { Bookmark } from "lucide-react";
import { useTranslations } from "~/components/language-provider";
import { Container } from "~/components/container";
import { MarketplacePrompts } from "./marketplace-prompts";
import type { Prompt } from "@prisma/client";

interface MarketplaceSavedProps {
  prompts: Prompt[];
  onCreditsUpdate: () => void;
  onShowAuthModal: () => void;
  onPromptClick: (prompt: Prompt) => void;
}

export function MarketplaceSaved({
  prompts,
  onCreditsUpdate,
  onShowAuthModal,
  onPromptClick,
}: MarketplaceSavedProps) {
  const translations = useTranslations();
  const hasPrompts = prompts.length > 0;

  return (
    <Container className="space-y-6 pb-16">
      {/* Header - description only shows when empty */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          {translations.marketplace.savedPrompts}
        </h2>
        {!hasPrompts && (
          <p className="mt-2 text-slate-600">
            {translations.marketplace.savedPromptsDescription}
          </p>
        )}
      </div>

      {hasPrompts ? (
        <MarketplacePrompts
          prompts={prompts}
          mode="saved"
          onCreditsUpdate={onCreditsUpdate}
          onShowAuthModal={onShowAuthModal}
          onPromptClick={onPromptClick}
        />
      ) : (
        <EmptySavedState translations={translations} />
      )}
    </Container>
  );
}

// Extracted for max 20 lines rule
function EmptySavedState({
  translations,
}: {
  translations: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 py-12 text-center">
      <Bookmark className="mx-auto mb-4 h-12 w-12 text-slate-400" />
      <p className="font-medium text-slate-600">
        {translations.marketplace.noSavedPrompts}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        {translations.marketplace.comingSoon}
      </p>
    </div>
  );
}
