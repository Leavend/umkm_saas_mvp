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
  onCreditsUpdate,
  onShowAuthModal,
  onPromptClick,
}: MarketplaceSavedProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Saved Prompts</h2>
        <p className="text-slate-600 mt-2">Your saved prompts appear here</p>
      </div>
      
      {prompts.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No saved prompts yet</p>
          <p className="text-slate-500 text-sm mt-2">Start browsing and save prompts you like!</p>
        </div>
      ) : (
        <MarketplacePrompts
          prompts={prompts}
          mode="saved"
          onPromptClick={onPromptClick}
        />
      )}
    </div>
  );
}