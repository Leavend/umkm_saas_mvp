import { Copy, Loader2, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import type { Prompt } from "@prisma/client";
import { usePromptCopy } from "~/hooks/use-prompt-copy";

interface CopyButtonProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

/**
 * Reusable copy button component for prompts
 * Handles copy functionality with proper loading and success states
 */
export function CopyButton({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
  variant = "default",
  size = "sm",
  className,
  showText = true,
  disabled,
  onClick,
}: CopyButtonProps) {
  const translations = useTranslations();
  const { isLoading, isCopied, copyPrompt } = usePromptCopy({
    onCreditsUpdate,
    onShowAuthModal,
  });

  const handleClick = (event: React.MouseEvent) => {
    onClick?.(event);
    void copyPrompt(prompt, event);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={(disabled ?? isLoading) || isCopied}
      onClick={handleClick}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
      ) : isCopied ? (
        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
      ) : (
        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
      )}
      {showText && (
        <span className="ml-1 hidden sm:inline">
          {isLoading
            ? translations.promptCard.copying
            : isCopied
              ? translations.promptCard.copied
              : translations.promptCard.copyPrompt}
        </span>
      )}
    </Button>
  );
}
