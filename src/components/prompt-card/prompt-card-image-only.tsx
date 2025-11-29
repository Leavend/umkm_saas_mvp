// Image-only variant of prompt card

import Image from "next/image";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { UI_CONSTANTS } from "~/lib/constants/ui";
import type { BasePromptCardProps } from "./types";

export function PromptCardImageOnly({
  prompt,
  onClick,
  reviewSafeImage,
}: BasePromptCardProps) {
  return (
    <Card
      className={cn(
        "group focus-visible:ring-brand-500/50 relative flex aspect-square h-full cursor-pointer overflow-hidden transition-all hover:shadow-lg focus-visible:ring-2",
        UI_CONSTANTS.colors.slate[200],
        "bg-white",
      )}
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
          className={cn(
            reviewSafeImage ? "object-contain" : "object-cover",
            "object-center transition-transform group-hover:scale-105",
          )}
          loading="lazy"
          placeholder="blur"
          blurDataURL={UI_CONSTANTS.image.blurPlaceholder}
          sizes={UI_CONSTANTS.image.sizes.card}
        />
        <Badge
          className={cn(
            "absolute top-2 right-2 text-xs text-slate-900 sm:text-sm",
            UI_CONSTANTS.colors.brand[500],
          )}
        >
          {prompt.category}
        </Badge>
      </div>
    </Card>
  );
}
