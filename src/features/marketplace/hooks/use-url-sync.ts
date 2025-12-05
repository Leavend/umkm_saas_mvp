import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useUrlSync(
  setMode: (mode: "browse" | "gallery" | "saved" | null) => void,
  setSelectedCategory: (category: string) => void,
) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Sync mode with URL on mount
    const modeParam = searchParams.get("mode");
    if (modeParam === "gallery" || modeParam === "saved") {
      setMode(modeParam);
    }

    // Sync category with URL on mount
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, setMode, setSelectedCategory]);
}
