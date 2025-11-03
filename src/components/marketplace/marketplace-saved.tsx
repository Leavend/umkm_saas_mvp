// src/components/marketplace/marketplace-saved.tsx
import { Bookmark } from "lucide-react";
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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Saved Prompts</h2>
        <p className="mt-2 text-slate-600">Your saved prompts appear here</p>
      </div>

      {prompts.length === 0 ? (
        <div className="py-12 text-center">
          <Bookmark className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="text-slate-600">No saved prompts yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Start browsing and save prompts you like!
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
    </div>
  );
}
