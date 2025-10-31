"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { copyPrompt } from "~/actions/prompts";
import type { Prompt } from "@prisma/client";

interface PromptCardProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
}

export function PromptCard({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
}: PromptCardProps) {
  const translations = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      setIsLoading(true);

      const result = await copyPrompt(prompt.id);

      if (!result.success) {
        toast.error(result.error);
        // If insufficient credits and we have a callback to show auth modal, use it
        if (result.error.includes("Insufficient credits") && onShowAuthModal) {
          onShowAuthModal();
        }
        return;
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(result.prompt.text);

      // Update credits display
      if (onCreditsUpdate) {
        onCreditsUpdate(result.remainingCredits);
      }

      // Show success feedback
      setIsCopied(true);
      toast.success(translations.promptCard.copiedToClipboard, {
        description: `${result.remainingCredits} ${translations.promptCard.creditsRemaining}`,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
      toast.error(translations.promptCard.copyFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-lg">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <Image
          src={prompt.imageUrl}
          alt={prompt.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <Badge className="bg-brand-500 absolute top-2 right-2 text-slate-900">
          {prompt.category}
        </Badge>
      </div>

      {/* Content */}
      <CardHeader className="flex-1">
        <CardTitle className="text-lg text-slate-800">{prompt.title}</CardTitle>
        <CardDescription className="line-clamp-3 text-sm text-slate-600">
          {prompt.text}
        </CardDescription>
      </CardHeader>

      {/* Footer with Copy Button */}
      <CardFooter className="pt-0">
        <Button
          className="w-full gap-2"
          variant={isCopied ? "default" : "outline"}
          disabled={isLoading || isCopied}
          onClick={handleCopy}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {translations.promptCard.copying}
            </>
          ) : isCopied ? (
            <>
              <Check className="h-4 w-4" />
              {translations.promptCard.copied}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {translations.promptCard.copyPrompt}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
