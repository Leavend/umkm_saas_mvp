"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useTranslations } from "~/components/language-provider";

interface PromptFeedbackProps {
  promptId: string;
  onRate?: (rating: boolean) => void;
  className?: string;
}

export function PromptFeedback({
  promptId,
  onRate,
  className,
}: PromptFeedbackProps) {
  const [rated, setRated] = useState(false);
  const t = useTranslations();

  const handleRate = (rating: boolean) => {
    setRated(true);
    onRate?.(rating);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setRated(false);
    }, 3000);
  };

  if (rated) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-green-50 px-2.5 py-2 text-xs text-green-700 sm:text-sm",
          className,
        )}
      >
        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="truncate">{t.promptFeedback.thankYou}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-white p-2.5 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-medium text-slate-700 sm:text-sm">
        {t.promptFeedback.question}
      </p>
      <div className="flex gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRate(true)}
          className="flex-1 text-[10px] text-green-600 hover:bg-green-50 sm:text-xs"
        >
          <Check className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
          <span className="truncate">{t.promptFeedback.thumbsUp}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRate(false)}
          className="flex-1 text-[10px] text-red-600 hover:bg-red-50 sm:text-xs"
        >
          <X className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
          <span className="truncate">{t.promptFeedback.thumbsDown}</span>
        </Button>
      </div>
    </div>
  );
}
