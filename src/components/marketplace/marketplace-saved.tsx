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
  onCreditsUpdate: _onCreditsUpdate,
  onShowAuthModal: _onShowAuthModal,
  onPromptClick,
}: MarketplaceSavedProps) {
  const translations = useTranslations();

  return (
    <Container className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          {translations.marketplace.savedPrompts}
        </h2>
        <p className="mt-2 text-slate-600">
          {translations.marketplace.savedPromptsDescription}
        </p>
      </div>

      {prompts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 py-12 text-center">
          <Bookmark className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="font-medium text-slate-600">
            {translations.marketplace.noSavedPrompts}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            More features coming soon!
          </p>
        </div>
      ) : (
        <MarketplacePrompts
          prompts={prompts}
          mode="saved"
          onCreditsUpdate={_onCreditsUpdate}
          onShowAuthModal={_onShowAuthModal}
          onPromptClick={onPromptClick}
        />
      )}
    </Container>
  );
}
