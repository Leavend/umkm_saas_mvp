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
          "flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700",
          className,
        )}
      >
        <Check className="h-4 w-4" />
        <span>{t.promptFeedback.thankYou}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-medium text-slate-700">
        {t.promptFeedback.question}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRate(true)}
          className="flex-1 text-green-600 hover:bg-green-50"
        >
          <Check className="mr-2 h-4 w-4" />
          {t.promptFeedback.thumbsUp}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRate(false)}
          className="flex-1 text-red-600 hover:bg-red-50"
        >
          <X className="mr-2 h-4 w-4" />
          {t.promptFeedback.thumbsDown}
        </Button>
      </div>
    </div>
  );
}
