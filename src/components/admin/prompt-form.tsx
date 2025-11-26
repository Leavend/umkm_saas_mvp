"use client";

import { useState } from "react";
import type { Prompt } from "@prisma/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { XIcon as X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PromptFormProps {
  prompt?: Prompt;
  onSubmit: (data: PromptFormData) => Promise<void>;
  onCancel: () => void;
}

export interface PromptFormData {
  title: string;
  text: string;
  imageUrl: string;
  category: string;
}

const CATEGORIES = [
  "portrait",
  "cinematic",
  "architecture",
  "abstract",
  "nature",
  "urban",
  "fantasy",
  "minimalist",
];

export function PromptForm({ prompt, onSubmit, onCancel }: PromptFormProps) {
  const [formData, setFormData] = useState<PromptFormData>({
    title: prompt?.title ?? "",
    text: prompt?.text ?? "",
    imageUrl: prompt?.imageUrl ?? "",
    category: prompt?.category ?? "portrait",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      toast.success(prompt ? "Prompt updated!" : "Prompt created!");
    } catch (error) {
      toast.error("Failed to save prompt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-200 bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          {prompt ? "Edit Prompt" : "Create New Prompt"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Title
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g. Professional Portrait"
            required
            className="border-slate-300"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Prompt Text
          </label>
          <textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            placeholder="Enter the full AI prompt text..."
            required
            rows={5}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Image URL
          </label>
          <div className="space-y-3">
            <Input
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg or https://images.unsplash.com/..."
              required
              className="border-slate-300"
            />
            <p className="text-xs text-slate-500">
              Use Unsplash, Pexels, or upload to ImageKit
            </p>
          </div>
        </div>

        {formData.imageUrl && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Preview</p>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {!formData.imageUrl && (
                <div className="flex h-full items-center justify-center">
                  <span className="text-4xl text-slate-300">🖼️</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 border-t border-slate-200 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>{prompt ? "Update Prompt" : "Create Prompt"}</>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-slate-300"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
