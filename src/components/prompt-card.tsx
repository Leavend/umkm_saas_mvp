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
  onClick?: (prompt: Prompt) => void;
  reviewSafeImage?: boolean;
}

export function PromptCard({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
  onClick,
  reviewSafeImage,
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
    <Card
      className="group focus-visible:ring-brand-500/50 relative flex h-full cursor-pointer flex-col overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-lg focus-visible:ring-2"
      onClick={() => onClick?.(prompt)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${prompt.title}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-slate-100">
        <Image
          src={prompt.imageUrl}
          alt={prompt.title}
          fill
          className={`${reviewSafeImage ? "object-contain" : "object-cover"} object-center transition-transform group-hover:scale-105`}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <Badge className="bg-brand-500 absolute top-2 right-2 text-slate-900">
          {prompt.category}
        </Badge>
      </div>

      {/* Content */}
      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-1 text-base leading-tight font-semibold [text-wrap:balance] text-slate-800 md:text-lg">
          {prompt.title}
        </CardTitle>
        <CardDescription className="mt-1 line-clamp-2 text-sm text-slate-600">
          {prompt.text}
        </CardDescription>
      </CardHeader>

      {/* Footer with Copy Button */}
      <CardFooter className="rounded-xl border border-slate-200 p-3">
        <Button
          className={`focus-visible:ring-brand-500/50 w-full gap-2 rounded-md px-3 py-2 text-sm focus-visible:ring-2 ${
            isCopied
              ? "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-slate-900"
              : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
          }`}
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
