import { Clock } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { useTranslations } from "~/components/language-provider";
import { formatDateShort } from "~/lib/utils";

interface UpdateBadgeProps {
  lastUpdated: Date | string;
  className?: string;
}

export function UpdateBadge({ lastUpdated, className }: UpdateBadgeProps) {
  const translations = useTranslations();
  const dateObj =
    typeof lastUpdated === "string" ? new Date(lastUpdated) : lastUpdated;
  const formattedDate = formatDateShort(dateObj);

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 border-slate-200 bg-white text-slate-600 ${className}`}
    >
      <Clock className="h-3 w-3" />
      <span className="text-xs">
        {translations.updateBadge.lastUpdated} {formattedDate}
      </span>
    </Badge>
  );
}
