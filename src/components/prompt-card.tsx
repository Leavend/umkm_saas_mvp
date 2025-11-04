// src/components/prompt-card.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
// Impor ikon baru
import { Copy, Loader2, Check, Share2, Bookmark, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
// Impor Separator
import { Separator } from "~/components/ui/separator";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { copyPrompt } from "~/actions/prompts";
import { cn } from "~/lib/utils";
import { useMarketUI } from "~/stores/use-market-ui";
import type { Prompt } from "@prisma/client";

interface PromptCardProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
  onClick?: (prompt: Prompt) => void;
  reviewSafeImage?: boolean;
  cardViewMode?: "default" | "image-only" | "full-description";
}

export function PromptCard({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
  onClick,
  reviewSafeImage,
  cardViewMode,
}: PromptCardProps) {
  const translations = useTranslations();
  const { cardViewMode: globalCardViewMode } = useMarketUI();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const currentCardViewMode = cardViewMode ?? globalCardViewMode;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Hentikan event agar tidak trigger onClick card
    try {
      setIsLoading(true);
      const result = await copyPrompt(prompt.id);
      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error.message;
        toast.error(errorMessage);
        if (
          typeof result.error === "string" &&
          result.error.includes("Insufficient credits") &&
          onShowAuthModal
        ) {
          onShowAuthModal();
        }
        return;
      }
      await navigator.clipboard.writeText(result.prompt.text);
      if (onCreditsUpdate) {
        onCreditsUpdate(result.remainingCredits);
      }
      setIsCopied(true);
      toast.success(translations.promptCard.copiedToClipboard, {
        description: `${result.remainingCredits} ${translations.promptCard.creditsRemaining}`,
      });
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

  // Tombol overlay (dummy, belum ada fungsi)
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Hentikan event agar tidak trigger onClick card
    toast.info("Fitur ini sedang dalam pengembangan.");
  };

  // Menjaga fungsionalitas mode image-only
  if (currentCardViewMode === "image-only") {
    // ... (kode untuk mode image-only tetap sama)
    return (
      <Card
        className="group focus-visible:ring-brand-500/50 relative flex aspect-square h-full cursor-pointer overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-lg focus-visible:ring-2"
        onClick={() => onClick?.(prompt)}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${prompt.title}`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-100">
          <Image
            src={prompt.imageUrl}
            alt={prompt.title}
            fill
            className={`${reviewSafeImage ? "object-contain" : "object-cover"} object-center transition-transform group-hover:scale-105`}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <Badge className="bg-brand-500 absolute top-2 right-2 text-xs text-slate-900 sm:text-sm">
            {prompt.category}
          </Badge>
        </div>
      </Card>
    );
  }

  // --- DESAIN KARTU BARU SESUAI GAMBAR 2 ---
  return (
    <Card
      // 1. Menghapus padding 'py-6' dari Card
      className="focus-visible:ring-brand-500/50 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 transition-all hover:shadow-lg focus-visible:ring-2"
      tabIndex={0}
      role="group"
      aria-label={`Prompt card for ${prompt.title}`}
    >
      {/* Gambar Review Full (Sudah benar dengan rounded-t-2xl) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-slate-100">
        <Image
          src={prompt.imageUrl}
          alt={prompt.title}
          fill
          className={`${reviewSafeImage ? "object-contain" : "object-cover"} object-center`}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white"
            onClick={handleOverlayClick}
            aria-label="Share prompt"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white"
            onClick={handleOverlayClick}
            aria-label="Save prompt"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Konten di bawah gambar */}
      <div className="flex flex-1 flex-col p-3 pt-2 sm:p-4">
        {/* Kategori */}
        <div className="mb-2 flex flex-wrap gap-1">
          <Badge
            variant="secondary"
            className="bg-brand-100 text-brand-800 text-xs"
          >
            {prompt.category}
          </Badge>
        </div>

        {/* 2. Deskripsi Scrollable (Menghapus kelas scrollbar-thin) */}
        <div className="h-24 overflow-y-auto">
          <p className="text-sm text-slate-700">{prompt.text}</p>
        </div>

        {/* Separator */}
        <Separator className="my-3" />

        {/* Tombol Bawah */}
        <div className="flex items-center justify-between gap-2">
          {/* 3. Tombol Generate (Menggunakan size="sm" h-8) */}
          <Button
            size="sm"
            variant="outline"
            className="w-full flex-1 gap-1.5 text-xs sm:text-sm"
            onClick={() => onClick?.(prompt)}
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            {translations.common.actions.goToGenerate}
          </Button>

          {/* 3. Tombol Copy (Menggunakan size="sm" h-8) */}
          <Button
            size="sm"
            className={cn(
              "w-full flex-1 gap-1.5 text-xs sm:text-sm",
              isCopied
                ? "bg-brand-500 hover:bg-brand-600 text-slate-900"
                : "bg-brand-500 hover:bg-brand-600 text-slate-900",
            )}
            disabled={isLoading || isCopied}
            onClick={handleCopy}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
            ) : isCopied ? (
              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            {isLoading
              ? translations.promptCard.copying
              : isCopied
                ? translations.promptCard.copied
                : translations.promptCard.copyPrompt}
          </Button>
        </div>
      </div>
    </Card>
  );
}
