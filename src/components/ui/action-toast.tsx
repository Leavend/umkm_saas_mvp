// Generic dynamic toast that appears below action buttons
"use client";

import { useEffect } from "react";
import { Check, X, Share2, Copy } from "lucide-react";
import { cn } from "~/lib/utils";

type ActionType = "saved" | "removed" | "shared" | "copied";

interface ActionToastProps {
  show: boolean;
  variant: ActionType;
  onDismiss: () => void;
}

const CONFIG: Record<
  ActionType,
  { icon: typeof Check; color: string; label: string }
> = {
  saved: { icon: Check, color: "bg-green-500", label: "Saved!" },
  removed: { icon: X, color: "bg-gray-500", label: "Removed" },
  shared: { icon: Share2, color: "bg-blue-500", label: "Shared!" },
  copied: { icon: Copy, color: "bg-purple-500", label: "Copied!" },
};

export function ActionToast({ show, variant, onDismiss }: ActionToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) return null;

  const config = CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "absolute top-full right-0 z-[9999] mt-2",
        "animate-in fade-in slide-in-from-top-2 duration-300",
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-white shadow-lg",
        config.color,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
}
