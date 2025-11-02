// src/components/footer.tsx
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
  const currentYear = new Date().getFullYear();
  
  // Format last updated date in Indonesian locale
  const formattedLastUpdated = new Date(lastUpdated).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <footer 
      role="contentinfo" 
      className="mx-auto w-full max-w-[var(--page-max)] border-t border-slate-200 px-4 pt-6 pb-8 md:pt-8 md:pb-10 text-center"
      style={{
        paddingLeft: "var(--page-gutter)",
        paddingRight: "var(--page-gutter)",
      }}
    >
      <div className="space-y-1">
        <p className="text-sm text-slate-500 leading-6 xs:text-xs">
          © {currentYear} {productName} is part of {parentBrand} by {org}
        </p>
        <p className="text-sm text-slate-500 leading-6 xs:text-xs">
          Update terakhir: {formattedLastUpdated}
        </p>
      </div>
    </footer>
  );
}