// Resource hints for better performance
// Preconnect to external services

export const resourceHints = [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "dns-prefetch", href: "https://accounts.google.com" },
  { rel: "dns-prefetch", href: "https://imagekit.io" },
] as const;

/**
 * Generate resource hint tags
 */
export const ResourceHints = () => (
  <>
    {resourceHints.map((hint, i) => (
      <link key={i} {...hint} />
    ))}
  </>
);
