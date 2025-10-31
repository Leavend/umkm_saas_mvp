"use client";

import { useState } from "react";
import { X, UserPlus, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useRouter } from "next/navigation";
import { useLocalePath } from "~/components/language-provider";

interface GuestConversionBannerProps {
  credits: number;
  projectsCount: number;
  onDismiss?: () => void;
}

export function GuestConversionBanner({
  credits,
  projectsCount,
  onDismiss,
}: GuestConversionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const router = useRouter();
  const toLocalePath = useLocalePath();

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleSignUp = () => {
    router.push(toLocalePath("/auth/sign-up"));
  };

  const shouldShowUrgency = credits <= 1 || projectsCount > 0;

  return (
    <Card className="border-brand-200 from-brand-50 bg-gradient-to-r to-slate-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="bg-brand-100 flex h-10 w-10 items-center justify-center rounded-full">
              <Sparkles className="text-brand-600 h-5 w-5" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-gray-900">
                  {shouldShowUrgency
                    ? "Don't lose your work!"
                    : "Save your progress"}
                </h3>
                <p className="mb-2 text-sm text-gray-600">
                  {shouldShowUrgency
                    ? `You have ${credits} credit${credits !== 1 ? "s" : ""} left and ${projectsCount} project${projectsCount !== 1 ? "s" : ""}. Sign up to keep everything!`
                    : "Sign up to save your projects and get more credits."}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSignUp}
                    className="bg-brand-500 hover:bg-brand-600 text-slate-900"
                  >
                    <UserPlus className="mr-1 h-4 w-4" />
                    Sign Up Free
                  </Button>
                  <span className="text-xs text-gray-500">
                    No credit card required
                  </span>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 rounded-md p-1 transition-colors hover:bg-gray-100"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
