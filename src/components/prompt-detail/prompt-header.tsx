import { X, Tag, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface PromptHeaderProps {
  title: string;
  category: string;
  updatedAt: Date;
  onClose: () => void;
  isLoading: boolean;
}

export function PromptHeader({
  title,
  category,
  updatedAt,
  onClose,
  isLoading,
}: PromptHeaderProps) {
  return (
    <div className="p-4 pb-0 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="pr-8 text-xl font-bold break-words text-slate-900 sm:text-2xl">
            {title}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 flex-shrink-0 rounded-full p-0"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-1">
          <Tag className="h-4 w-4 flex-shrink-0" />
          <Badge
            variant="secondary"
            className="bg-brand-100 text-brand-800 text-xs sm:text-sm"
          >
            {category}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span className="text-xs sm:text-sm">
            {new Date(updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
