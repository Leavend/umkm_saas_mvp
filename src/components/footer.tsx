// src/components/footer.tsx
import { formatDate } from "~/lib/utils";
import { useTranslations } from "~/components/language-provider";

interface FooterProps {
  lastUpdated?: string;
  productName?: string;
  parentBrand?: string;
  org?: string;
}

export function Footer({
  lastUpdated = "2025-11-01",
  productName = "Apakek Prompt",
  parentBrand = "UMKMJaya",
  org = "Bontang Techno Hub",
}: FooterProps) {
  const translations = useTranslations();
  const t = translations.common.footer;
  const currentYear = new Date().getFullYear();

  const formattedLastUpdated = formatDate(new Date(lastUpdated), "id-ID");

  return (
    <footer
      role="contentinfo"
      className="mx-auto w-full max-w-[var(--page-max)] border-t border-slate-200 pt-4 pb-6 text-center sm:pt-6 sm:pb-8 md:pt-8 md:pb-10"
      style={{
        paddingLeft: "var(--page-gutter)",
        paddingRight: "var(--page-gutter)",
      }}
    >
      <div className="space-y-1">
        <p className="text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
          © {currentYear} {productName} {t.isPartOf} {parentBrand} {t.by} {org}
        </p>
        <p className="text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
          {t.lastUpdated} {formattedLastUpdated}
        </p>
      </div>
    </footer>
  );
}
