// src/components/marketplace/marketplace-gallery.tsx
import { MarketplacePrompts } from "./marketplace-prompts";
import type { Prompt } from "@prisma/client";

interface MarketplaceGalleryProps {
  prompts: Prompt[];
  onCreditsUpdate: () => void;
  onShowAuthModal: () => void;
  onPromptClick: (prompt: Prompt) => void;
}

export function MarketplaceGallery({
  prompts,
  onCreditsUpdate,
  onShowAuthModal,
  onPromptClick,
}: MarketplaceGalleryProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Gallery View</h2>
        <p className="text-slate-600 mt-2">Browse all prompts in gallery mode</p>
      </div>
      
      <MarketplacePrompts
        prompts={prompts}
        mode="gallery"
        onPromptClick={onPromptClick}
      />
    </div>
  );
}