import { useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Prompt } from "@prisma/client";

export function useMarketplaceRouting(
  lang: string,
  allPrompts: Prompt[],
  setSelectedPrompt: (prompt: Prompt | null) => void,
) {
  const router = useRouter();
  const pathname = usePathname();

  // Navigate to prompt using sequence number for cleaner URLs
  const navigateToPrompt = useCallback(
    (sequenceNumber: number) => {
      router.push(`/${lang}/${sequenceNumber}`, { scroll: false });
    },
    [router, lang],
  );

  const navigateToHome = useCallback(() => {
    router.push(`/${lang}`, { scroll: false });
  }, [router, lang]);

  // Handle URL changes - parse sequence number from URL
  const handleRouteChange = useCallback(() => {
    const pathParts = pathname.split("/").filter(Boolean);

    if (pathParts.length === 2 && pathParts[0] === lang) {
      const seq = parseInt(pathParts[1]!, 10);
      if (!isNaN(seq) && seq > 0) {
        const prompt = allPrompts.find((p) => p.sequenceNumber === seq);
        if (prompt) {
          setSelectedPrompt(prompt);
        }
      }
    } else if (pathParts.length === 1 && pathParts[0] === lang) {
      setSelectedPrompt(null);
    }
  }, [pathname, lang, allPrompts, setSelectedPrompt]);

  useEffect(() => {
    handleRouteChange();
  }, [handleRouteChange]);

  return { navigateToPrompt, navigateToHome, handleRouteChange };
}
