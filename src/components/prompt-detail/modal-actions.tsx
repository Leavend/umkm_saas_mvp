import { Check, Copy } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";

interface ModalActionsProps {
  isLoading: boolean;
  isCopied: boolean;
  onCopy: () => void;
  onClose: () => void;
}

export function ModalActions({
  isLoading,
  isCopied,
  onCopy,
  onClose,
}: ModalActionsProps) {
  const translations = useTranslations();

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row">
      <Button
        className="bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500/50 w-full gap-2 text-slate-900 sm:flex-1"
        disabled={isLoading || isCopied}
        onClick={onCopy}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            <span className="hidden sm:inline">
              {translations.promptCard.copying}
            </span>
            <span className="sm:hidden">{translations.promptCard.copying}</span>
          </>
        ) : isCopied ? (
          <>
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">
              {translations.promptCard.copied}
            </span>
            <span className="sm:hidden">{translations.promptCard.copied}</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">
              {translations.promptCard.copyPrompt}
            </span>
            <span className="sm:hidden">
              {translations.promptCard.copyPrompt}
            </span>
          </>
        )}
      </Button>

      <Button
        variant="outline"
        onClick={onClose}
        className="focus-visible:ring-brand-500/50 w-full px-6 sm:w-auto"
      >
        Close
      </Button>
    </div>
  );
}
