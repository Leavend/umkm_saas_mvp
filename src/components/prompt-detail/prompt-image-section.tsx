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
        <div className="relative flex-shrink-0 bg-slate-100 md:w-1/2">
            <div className="relative aspect-square w-full">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
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
        <div className="absolute bottom-3 right-3 flex gap-2">
            <div className="relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/90 text-slate-700 shadow-md hover:bg-white"
                    onClick={onShare}
                    aria-label="Share prompt"
                >
                    <Share2 className="h-4 w-4" />
                </Button>
                <ActionToast
                    show={shareStatus === "shared"}
                    variant="shared"
                    onDismiss={onClearShareStatus}
                />
            </div>
            <div className="relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-9 w-9 rounded-full bg-white/90 shadow-md hover:bg-white",
                        isSaved ? "text-brand-500" : "text-slate-700",
                    )}
                    onClick={onBookmark}
                    disabled={isBookmarkLoading}
                    aria-label={isSaved ? "Remove from saved" : "Save prompt"}
                >
                    {isBookmarkLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Icon
                            name="Bookmark"
                            className={cn("h-4 w-4", isSaved && "fill-current")}
                        />
                    )}
                </Button>
                <ActionToast
                    show={bookmarkStatus === "saved" || bookmarkStatus === "removed"}
                    variant={bookmarkStatus === "saved" ? "saved" : "removed"}
                    onDismiss={onClearBookmarkStatus}
                />
            </div>
        </div>
    );
}
