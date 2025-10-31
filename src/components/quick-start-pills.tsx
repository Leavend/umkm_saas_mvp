"use client";

import { cn } from "~/lib/utils";
import { UserRound, Venus, Sunset, Building2 } from "lucide-react";

type Item = { id: string; label: string; icon: React.ReactNode };

const items: Item[] = [
  {
    id: "mens-portrait",
    label: "Men's Portrait",
    icon: <UserRound className="h-4 w-4" />,
  },
  {
    id: "womens-portrait",
    label: "Women's Portrait",
    icon: <Venus className="h-4 w-4" />,
  },
  {
    id: "sunset-landscape",
    label: "Sunset Landscape",
    icon: <Sunset className="h-4 w-4" />,
  },
  {
    id: "modern-building",
    label: "Modern Building",
    icon: <Building2 className="h-4 w-4" />,
  },
];

export function QuickStartPills({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const pill =
    "inline-flex items-center gap-2 rounded-full " +
    "h-9 md:h-10 px-3 md:px-4 text-sm font-medium " +
    "border border-slate-200 bg-white shadow-sm text-slate-900 " +
    "hover:bg-slate-100 active:bg-slate-200 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 " +
    "transition duration-150";

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          aria-label={it.label}
          onClick={() => onSelect(it.id)}
          className={cn(pill)}
        >
          {it.icon}
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}
