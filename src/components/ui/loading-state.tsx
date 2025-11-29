// Loading state component for consistent loading UI

import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface LoadingStateProps {
  isLoading: boolean;
  children?: React.ReactNode;
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

/**
 * Consistent loading state component with spinner
 * Can be used as overlay or inline
 */
export function LoadingState({
  isLoading,
  children,
  message,
  size = "md",
  className,
  fullScreen = false,
}: LoadingStateProps) {
  if (!isLoading && !children) return null;

  if (!isLoading) {
    return <>{children}</>;
  }

  const spinnerSize = sizeClasses[size];

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-xl">
          <Loader2 className={cn(spinnerSize, "animate-spin text-slate-900")} />
          {message && (
            <p className="text-sm font-medium text-slate-700">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn(spinnerSize, "animate-spin text-slate-900")} />
      {message && <span className="text-sm text-slate-700">{message}</span>}
    </div>
  );
}

/**
 * Loading button variant (inline with text)
 */
export function LoadingButton({
  isLoading,
  children,
  loadingText = "Loading...",
  size = "sm",
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (!isLoading) {
    return <>{children}</>;
  }

  const spinnerSize = sizeClasses[size];

  return (
    <span className="flex items-center gap-2">
      <Loader2 className={cn(spinnerSize, "animate-spin")} />
      {loadingText}
    </span>
  );
}
