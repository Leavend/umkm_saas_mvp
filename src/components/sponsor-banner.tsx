"use client";

import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { SPONSOR_DATA } from "~/lib/placeholder-data";

interface SponsorBannerProps {
  onCtaClick?: () => void;
  className?: string;
}

export function SponsorBanner({ onCtaClick, className }: SponsorBannerProps) {
  return (
    <Card
      className={`from-brand-50 overflow-hidden border-slate-200 bg-gradient-to-r to-slate-50 ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold text-slate-900">
              {SPONSOR_DATA.title}
            </h3>
            <p className="text-sm text-slate-600">{SPONSOR_DATA.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={SPONSOR_DATA.imageUrl}
                alt="Premium features preview"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            <Button
              onClick={onCtaClick}
              className="bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500/50 whitespace-nowrap text-slate-900"
            >
              {SPONSOR_DATA.ctaText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
