import { Copy, Loader2, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ActionToast } from "~/components/ui/action-toast";
import { useTranslations } from "~/components/language-provider";
import type { Prompt } from "@prisma/client";
import { usePromptCopy } from "~/hooks/use-prompt-copy";
import { useEffect } from "react";

interface CopyButtonProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
  onCopySuccess?: () => void;
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
  showToast?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

/**
 * Copy button with dynamic toast appearing below
 */
export function CopyButton({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
  onCopySuccess,
  variant = "default",
  size = "sm",
  className,
  showText = true,
  showToast = false,
  disabled,
  onClick,
}: CopyButtonProps) {
  const translations = useTranslations();
  const { isLoading, status, clearStatus, copyPrompt } = usePromptCopy({
    onCreditsUpdate,
    onShowAuthModal,
  });

  const handleClick = (event: React.MouseEvent) => {
    onClick?.(event);
    void copyPrompt(prompt, event);
  };

  const isCopied = status === "copied";
  const showCopyToast = showToast && isCopied;

  // Call onCopySuccess when copy succeeds
  useEffect(() => {
    if (isCopied && onCopySuccess) {
      onCopySuccess();
    }
  }, [isCopied, onCopySuccess]);

  return (
    <div className="relative inline-block">
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
      <ActionToast
        show={showCopyToast}
        variant="copied"
        onDismiss={clearStatus}
      />
    </div>
  );
}
