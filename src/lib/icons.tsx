// Icon utility for consistent icon usage
// Max 20 lines per function - clean and focused

import * as Icons from "lucide-react";
import { Loader2, type LucideIcon } from "lucide-react";

type IconName = keyof typeof Icons;

/**
 * Get icon component by name
 * @param name Icon name from lucide-react
 * @returns Icon component or fallback
 */
export const getIcon = (name: IconName): LucideIcon => {
  return (Icons[name] as LucideIcon) || Loader2;
};

/**
 * Render icon with consistent sizing
 * @param name Icon name
 * @param className Additional classes
 */
export const Icon = ({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) => {
  const IconComponent = getIcon(name);
  return <IconComponent className={className} />;
};
