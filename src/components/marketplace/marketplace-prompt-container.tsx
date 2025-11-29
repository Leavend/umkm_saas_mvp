// src/components/marketplace/marketplace-prompt-container.tsx

"use client";

import { Images, Bookmark } from "lucide-react";
import { Container } from "~/components/container";
import { MarketplacePrompts } from "./marketplace-prompts";
import { useMarketUI } from "~/stores/use-market-ui";
import { useTranslations } from "~/components/language-provider";
import type { Prompt } from "@prisma/client";
import type { Mode } from "~/stores/use-market-ui";

interface MarketplacePromptContainerProps {
  prompts: Prompt[];
  mode: Mode;
  onCreditsUpdate: (credits: number) => void;
  onShowAuthModal: () => void;
  onPromptClick: (prompt: Prompt) => void;
}

function EmptyPanel({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-6 w-6" />
      </div>
      <p className="font-medium text-slate-800">{title}</p>
      <p className="text-sm">{desc}</p>
    </div>
  );
}

export function MarketplacePromptContainer({
  prompts,
  mode,
  onCreditsUpdate,
  onShowAuthModal,
  onPromptClick,
}: MarketplacePromptContainerProps) {
  const { view } = useMarketUI();
  const translations = useTranslations();

  return (
    <section className="mt-6 pb-28 md:mt-8 md:pb-10">
      <Container className="h-full">
        {mode === "gallery" && (
          <EmptyPanel
            icon={Images}
            title={translations.marketplace.galleryTitle}
            desc={translations.marketplace.galleryDescription}
          />
        )}

        {mode === "saved" && (
          <EmptyPanel
            icon={Bookmark}
            title={translations.marketplace.savedTitle}
            desc={translations.marketplace.savedPromptsDescription}
          />
        )}

        {/* ===== PERUBAHAN DI SINI ===== */}
        {/* Div pembungkus (rounded-2xl, border, bg-white, shadow-sm, p-6) telah dihapus */}
        {/* Kita ganti dengan React Fragment <></> agar tidak ada div ekstra */}
        {mode === "browse" && (
          <>
            {/* Header "Available Prompts" tetap dipertahankan */}
            <div className="mb-4 flex items-center justify-between px-1">
              <h2 className="text-xl font-semibold text-slate-900">
                {translations.marketplace.availablePrompts}
              </h2>
              <div className="text-sm text-neutral-500">
                {prompts.length}{" "}
                {prompts.length === 1
                  ? translations.marketplace.promptSingular
                  : translations.marketplace.promptPlural}
              </div>
            </div>

            {/* Komponen MarketplacePrompts (grid kartu) */}
            <MarketplacePrompts
              prompts={prompts}
              onCreditsUpdate={onCreditsUpdate}
              onShowAuthModal={onShowAuthModal}
              onPromptClick={onPromptClick}
            />
          </>
        )}
        {/* ===== BATAS PERUBAHAN ===== */}
      </Container>
    </section>
  );
}
