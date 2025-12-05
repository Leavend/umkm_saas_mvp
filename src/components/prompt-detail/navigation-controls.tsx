import { Button } from "~/components/ui/button";
import { Icon } from "~/lib/icons";

interface NavigationControlsProps {
  hasPrev: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isLoading: boolean;
}

export function NavigationControls({
  hasPrev,
  hasNext,
  onPrevious,
  onNext,
  isLoading,
}: NavigationControlsProps) {
  return (
    <>
      {hasPrev && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 left-2 z-50 h-10 w-10 -translate-y-1/2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 sm:left-4"
          onClick={onPrevious}
          disabled={isLoading}
          aria-label="Previous prompt"
        >
          {/* @ts-expect-error - Icon name type mismatch in some environments */}
          <Icon name="ChevronLeft" className="h-5 w-5" />
        </Button>
      )}
      {hasNext && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-2 z-50 h-10 w-10 -translate-y-1/2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 sm:right-4"
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
