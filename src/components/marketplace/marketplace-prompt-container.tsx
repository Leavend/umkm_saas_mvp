// src/components/marketplace/marketplace-prompt-container.tsx

import { MarketplacePrompts } from "./marketplace-prompts";
import type { Prompt } from "@prisma/client";
import type { ViewMode } from "~/lib/types";

interface MarketplacePromptContainerProps {
  prompts: Prompt[];
  viewMode: ViewMode;
  onCreditsUpdate: (credits: number) => void;
  onShowAuthModal: () => void;
}

export function MarketplacePromptContainer({
  prompts,
  viewMode,
  onCreditsUpdate,
  onShowAuthModal,
}: MarketplacePromptContainerProps) {
  return (
    <section className="flex-1 py-10">
      <div className="container-tight h-full">
        <div
          className={`flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm ${prompts.length ? "p-8" : "p-6"}`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              {viewMode === "saved" ? "Saved Prompts" : "Available Prompts"}
            </h2>
            <div className="text-sm text-neutral-500">
              {prompts.length} {prompts.length === 1 ? "prompt" : "prompts"}
            </div>
          </div>

          <MarketplacePrompts
            prompts={prompts}
            onCreditsUpdate={onCreditsUpdate}
            onShowAuthModal={onShowAuthModal}
          />
        </div>
      </div>
    </section>
  );
}
