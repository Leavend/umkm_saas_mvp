// Action buttons component for prompt cards

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { CopyButton } from "~/components/ui/copy-button";
import { PromptFeedback } from "~/components/prompt-feedback";
import { ratePrompt } from "~/actions/prompt-ratings";
import { cn } from "~/lib/utils";
import { UI_CONSTANTS } from "~/lib/constants/ui";
import type { Prompt } from "@prisma/client";

interface ActionButtonsProps {
  onClick?: (prompt: Prompt) => void;
  prompt: Prompt;
  onShowAuthModal?: () => void;
  onCreditsUpdate?: (credits: number) => void;
  translations: {
    common: { actions: { goToGenerate: string } };
    marketplace: { featureInDevelopment: string };
  };
}

export function ActionButtons({
  onClick,
  prompt,
  onShowAuthModal,
  onCreditsUpdate,
  translations,
}: ActionButtonsProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleCopySuccess = () => {
    setShowFeedback(true);
  };

  const handleRate = async (rating: boolean) => {
    await ratePrompt({ promptId: prompt.id, rating });
    setTimeout(() => setShowFeedback(false), 3000);
  };

  return (
    <div className="space-y-1.5 p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className={cn(
            UI_CONSTANTS.component.button.sm,
            "flex-1 gap-1.5 text-[10px] sm:w-auto sm:flex-none sm:text-xs",
          )}
          onClick={(e) => {
            e.stopPropagation();
            toast.info(translations.marketplace.featureInDevelopment);
          }}
        >
          <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="truncate">
            {translations.common.actions.goToGenerate}
          </span>
        </Button>

        <CopyButton
          prompt={prompt}
          onCreditsUpdate={onCreditsUpdate}
          onShowAuthModal={onShowAuthModal}
          onCopySuccess={handleCopySuccess}
          size="sm"
          className={cn(
            UI_CONSTANTS.component.button.sm,
            "flex-1 text-[10px] sm:w-auto sm:flex-none sm:text-xs",
          )}
          showText={false}
          showToast={true}
        />
      </div>

      {showFeedback && (
        <PromptFeedback promptId={prompt.id} onRate={handleRate} />
      )}
    </div>
  );
}
