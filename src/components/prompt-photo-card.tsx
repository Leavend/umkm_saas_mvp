"use client";

import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { CopyButton } from "~/components/ui/copy-button";
import { useMarketUI } from "~/stores/use-market-ui";
import type { Prompt } from "@prisma/client";

interface PromptPhotoCardProps {
  prompt: Prompt;
  onCreditsUpdate?: (credits: number) => void;
  onShowAuthModal?: () => void;
  onClick?: (prompt: Prompt) => void;
  cardViewMode?: "default" | "image-only" | "full-description";
}

export function PromptPhotoCard({
  prompt,
  onCreditsUpdate,
  onShowAuthModal,
  onClick,
  cardViewMode,
}: PromptPhotoCardProps) {
  const { cardViewMode: globalCardViewMode } = useMarketUI();
  const currentCardViewMode = cardViewMode ?? globalCardViewMode;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(prompt);
    }
  };

  return (
    <div
      className={`group focus-visible:ring-brand-500/50 relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-lg focus-visible:ring-2 ${
        currentCardViewMode === "full-description" ? "aspect-auto" : ""
      }`}
      onClick={() => onClick?.(prompt)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${prompt.title}`}
    >
      {/* Image Container */}
      <div
        className={`relative ${
          currentCardViewMode === "full-description"
            ? "aspect-[4/3]"
            : "aspect-square"
        } overflow-hidden`}
      >
        <Image
          src={prompt.imageUrl}
          alt={prompt.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />

        {/* Category Badge */}
        <Badge className="bg-brand-500 absolute top-2 right-2 text-xs text-slate-900 sm:text-sm">
          {prompt.category}
        </Badge>

        {/* Full Description Content */}
        {currentCardViewMode === "full-description" ? (
          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
            <h3 className="mb-2 line-clamp-1 text-base font-semibold text-white">
              {prompt.title}
            </h3>
            <p className="mb-3 line-clamp-3 text-sm text-white/90">
              {prompt.text}
            </p>
            <CopyButton
              prompt={prompt}
              onCreditsUpdate={onCreditsUpdate}
              onShowAuthModal={onShowAuthModal}
              className="w-full"
              showText
            />
          </div>
        ) : (
          /* Overlay with copy button */
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <div className="absolute right-0 bottom-0 left-0 p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-white">
                    {prompt.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-white/80">
                    {prompt.text}
                  </p>
                </div>
                <CopyButton
                  prompt={prompt}
                  onCreditsUpdate={onCreditsUpdate}
                  onShowAuthModal={onShowAuthModal}
                  variant="outline"
                  size="icon"
                  className="ml-2 h-8 w-8 rounded-full bg-white/90 p-0 text-slate-900 hover:bg-white"
                  showText={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
