import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DialogHeader as DialogHeaderPrimitive,
  DialogTitle as DialogTitlePrimitive,
  DialogDescription as DialogDescriptionPrimitive,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import type { BaseComponentProps } from "~/lib/types";

interface ModalHeaderProps extends BaseComponentProps {
  title: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  closeDisabled?: boolean;
  closeButtonLabel?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

/**
 * Reusable modal header component with consistent styling and behavior
 * Provides accessibility features and customizable options
 */
export function ModalHeader({
  title,
  description,
  showCloseButton = true,
  onClose,
  closeDisabled = false,
  closeButtonLabel = "Close modal",
  titleClassName,
  descriptionClassName,
  className,
}: ModalHeaderProps) {
  return (
    <DialogHeaderPrimitive className={cn("relative", className)}>
      {/* Close button positioned in top-right */}
      {showCloseButton && onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-0 right-0 h-8 w-8 rounded-full p-0"
          onClick={onClose}
          disabled={closeDisabled}
          aria-label={closeButtonLabel}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Title */}
      <DialogTitlePrimitive
        className={cn(
          "text-xl font-semibold text-gray-900 pr-10", // Add right padding for close button
          titleClassName,
        )}
      >
        {title}
      </DialogTitlePrimitive>

      {/* Optional description */}
      {description && (
        <DialogDescriptionPrimitive
          className={cn("text-sm text-gray-600 mt-1", descriptionClassName)}
        >
          {description}
        </DialogDescriptionPrimitive>
      )}
    </DialogHeaderPrimitive>
  );
}

interface CompactModalHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  closeDisabled?: boolean;
  closeButtonLabel?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

/**
 * Compact modal header for space-efficient modals
 * Features a more minimal design with optional subtitle
 */
export function CompactModalHeader({
  title,
  subtitle,
  showCloseButton = true,
  onClose,
  closeDisabled = false,
  closeButtonLabel = "Close",
  titleClassName,
  subtitleClassName,
  className,
}: CompactModalHeaderProps) {
  return (
    <div className={cn("flex justify-between items-center mb-4", className)}>
      <div className="min-w-0 flex-1">
        <h2
          className={cn(
            "text-sm font-medium text-foreground truncate",
            titleClassName,
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "text-xs text-muted-foreground mt-0.5 truncate",
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {showCloseButton && onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto rounded-md px-3 py-1.5 text-xs flex-shrink-0 ml-2"
          onClick={onClose}
          disabled={closeDisabled}
          aria-label={closeButtonLabel}
        >
          Close
        </Button>
      )}
    </div>
  );
}