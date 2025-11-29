// Empty search state with prompt request form
"use client";

import { useState } from "react";
import { Search, Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import { savePromptRequest } from "~/actions/prompt-requests";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { trackEvent } from "~/lib/analytics";
import { useSession } from "~/lib/auth-client";

interface EmptySearchStateProps {
  searchQuery?: string;
}

export function EmptySearchState({ searchQuery }: EmptySearchStateProps) {
  const translations = useTranslations();
  const t = translations.marketplace.emptySearch;
  const { data: session } = useSession();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error(t.descriptionRequired || "Please describe what you need");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await savePromptRequest({
        description: description.trim(),
        category: category || undefined,
      });

      if (result.success) {
        // Track analytics event
        trackEvent("prompt_requested", {
          category: category || "none",
          isAuthenticated: !!session?.user,
          searchQuery: searchQuery || "direct",
        });

        toast.success(t.success);
        setDescription("");
        setCategory("");
      } else {
        toast.error(result.error || t.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Submit request error:", error);
      toast.error(t.error || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-12">
      {/* Icon */}
      <div className="mb-6 rounded-full bg-slate-100 p-6">
        <Search className="h-12 w-12 text-slate-400" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-center text-2xl font-bold text-slate-900">
        {t.title}
      </h3>

      {/* Search Query */}
      {searchQuery && (
        <p className="mb-4 text-center text-sm text-slate-600">
          {t.noResultsFor || "No results for"}{" "}
          <span className="font-semibold">&quot;{searchQuery}&quot;</span>
        </p>
      )}

      {/* Description */}
      <p className="mb-8 max-w-md text-center text-slate-600">
        {t.description}
      </p>

      {/* Request Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        {/* Description Textarea */}
        <div>
          <label htmlFor="description" className="sr-only">
            {t.placeholder}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.placeholder}
            rows={4}
            disabled={isSubmitting}
            className={cn(
              "w-full resize-none rounded-lg border border-slate-300 px-4 py-3",
              "text-sm placeholder:text-slate-400",
              "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
        </div>

        {/* Category Input (Optional) */}
        <div>
          <label htmlFor="category" className="sr-only">
            {t.categoryLabel}
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t.categoryLabel}
            disabled={isSubmitting}
            className={cn(
              "w-full rounded-lg border border-slate-300 px-4 py-3 text-sm",
              "placeholder:text-slate-400",
              "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !description.trim()}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Send className="mr-2 h-4 w-4 animate-spin" />
              {t.submitting || "Submitting..."}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {t.submit}
            </>
          )}
        </Button>
      </form>

      {/* Helper Text */}
      <p className="mt-6 text-center text-xs text-slate-500">
        {t.helperText ||
          "We'll review your request and add it to the marketplace if possible."}
      </p>
    </div>
  );
}
