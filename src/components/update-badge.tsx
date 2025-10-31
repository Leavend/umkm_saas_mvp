import { Clock } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface UpdateBadgeProps {
  lastUpdated: Date;
  className?: string;
}

export function UpdateBadge({ lastUpdated, className }: UpdateBadgeProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 border-slate-200 bg-white text-slate-600 ${className}`}
    >
      <Clock className="h-3 w-3" />
      <span className="text-xs">Last updated: {formatDate(lastUpdated)}</span>
    </Badge>
  );
}
