import { Clock } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { formatDateShort } from "~/lib/utils";

interface UpdateBadgeProps {
  lastUpdated: Date;
  className?: string;
}

export function UpdateBadge({ lastUpdated, className }: UpdateBadgeProps) {
  const formattedDate = formatDateShort(lastUpdated);

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 border-slate-200 bg-white text-slate-600 ${className}`}
    >
      <Clock className="h-3 w-3" />
      <span className="text-xs">Last updated: {formattedDate}</span>
    </Badge>
  );
}
