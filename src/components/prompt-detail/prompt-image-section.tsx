import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Icon } from "~/lib/icons";
import { Share2, Loader2 } from "lucide-react";
import { ActionToast } from "~/components/ui/action-toast";
import { cn } from "~/lib/utils";

interface PromptImageSectionProps {
    imageUrl: string;
    title: string;
    hasPrev: boolean;
    hasNext: boolean;
    isLoading: boolean;
    isSaved: boolean;
    isBookmarkLoading: boolean;
    shareStatus: string;
    bookmarkStatus: string;
    onPrevious: () => void;
    onNext: () => void;
    onShare: () => void;
    onBookmark: () => void;
    onClearShareStatus: () => void;
    onClearBookmarkStatus: () => void;
}

export function PromptImageSection({
    imageUrl,
    title,
    hasPrev,
    hasNext,
    isLoading,
    isSaved,
    isBookmarkLoading,
    shareStatus,
    bookmarkStatus,
    onPrevious,
    onNext,
    onShare,
    onBookmark,
    onClearShareStatus,
    onClearBookmarkStatus,
}: PromptImageSectionProps) {
    return (
        <div className="relative flex-shrink-0 bg-slate-900 md:w-1/2">
            <div className="relative aspect-square w-full">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
                {/* Gradient overlay for better button visibility */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                <NavigationButtons
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    isLoading={isLoading}
                    onPrevious={onPrevious}
                    onNext={onNext}
                />
            </div>
            <ActionButtons
                isSaved={isSaved}
                isBookmarkLoading={isBookmarkLoading}
                shareStatus={shareStatus}
                bookmarkStatus={bookmarkStatus}
                onShare={onShare}
                onBookmark={onBookmark}
                onClearShareStatus={onClearShareStatus}
                onClearBookmarkStatus={onClearBookmarkStatus}
            />
        </div>
    );
}

function NavigationButtons({
    hasPrev,
    hasNext,
    isLoading,
    onPrevious,
    onNext,
}: {
    hasPrev: boolean;
    hasNext: boolean;
    isLoading: boolean;
    onPrevious: () => void;
    onNext: () => void;
}) {
    return (
        <>
            {hasPrev && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700"
                    onClick={onPrevious}
                    disabled={isLoading}
                    aria-label="Previous prompt"
                >
                    {/* @ts-expect-error - Icon name type mismatch */}
                    <Icon name="ChevronLeft" className="h-5 w-5" />
                </Button>
            )}
            {hasNext && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700"
                    onClick={onNext}
                    disabled={isLoading}
                    aria-label="Next prompt"
                >
                    <Icon name="ChevronRight" className="h-5 w-5" />
                </Button>
            )}
        </>
    );
}

function ActionButtons({
    isSaved,
    isBookmarkLoading,
    shareStatus,
    bookmarkStatus,
    onShare,
    onBookmark,
    onClearShareStatus,
    onClearBookmarkStatus,
}: {
    isSaved: boolean;
    isBookmarkLoading: boolean;
    shareStatus: string;
    bookmarkStatus: string;
    onShare: () => void;
    onBookmark: () => void;
    onClearShareStatus: () => void;
    onClearBookmarkStatus: () => void;
}) {
    return (
        <div className="absolute bottom-4 right-4 flex gap-2">
            <GlassButton onClick={onShare} ariaLabel="Share prompt">
                <Share2 className="h-4 w-4" />
                <ActionToast show={shareStatus === "shared"} variant="shared" onDismiss={onClearShareStatus} />
            </GlassButton>
            <GlassButton
                onClick={onBookmark}
                disabled={isBookmarkLoading}
                ariaLabel={isSaved ? "Remove from saved" : "Save prompt"}
                isActive={isSaved}
            >
                {isBookmarkLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Icon name="Bookmark" className={cn("h-4 w-4", isSaved && "fill-current")} />
                )}
                <ActionToast
                    show={bookmarkStatus === "saved" || bookmarkStatus === "removed"}
                    variant={bookmarkStatus === "saved" ? "saved" : "removed"}
                    onDismiss={onClearBookmarkStatus}
                />
            </GlassButton>
        </div>
    );
}

function GlassButton({
    onClick,
    disabled,
    ariaLabel,
    isActive,
    children,
}: {
    onClick: () => void;
    disabled?: boolean;
    ariaLabel: string;
    isActive?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-10 w-10 rounded-full border border-white/20 bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-105",
                    isActive ? "text-amber-500" : "text-slate-700",
                )}
                onClick={onClick}
                disabled={disabled}
                aria-label={ariaLabel}
            >
                {children}
            </Button>
        </div>
    );
}

