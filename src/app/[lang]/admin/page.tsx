"use client";

import { useState, useEffect } from "react";
import type { Prompt } from "@prisma/client";
import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import { PromptForm, type PromptFormData } from "~/components/admin/prompt-form";
import { PromptList } from "~/components/admin/prompt-list";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createPrompt,
  updatePrompt,
  deletePrompt,
  getAllPromptsAdmin,
} from "~/actions/admin-prompts";

type ViewMode = "list" | "create" | "edit";

export default function AdminPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPrompts = async () => {
    setIsLoading(true);
    const result = await getAllPromptsAdmin();

    if (result.success && result.data) {
      setPrompts(result.data.prompts);
    } else {
      const errorMsg = typeof result.error === 'string' ? result.error : result.error?.message ?? 'Failed to load prompts';
      toast.error(errorMsg);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void loadPrompts();
  }, []);

  const handleCreate = async (data: PromptFormData) => {
    const result = await createPrompt(data);

    if (result.success) {
      toast.success("Prompt created successfully!");
      setViewMode("list");
      await loadPrompts();
    } else {
      const errorMsg = typeof result.error === 'string' ? result.error : result.error?.message ?? 'Failed to create prompt';
      toast.error(errorMsg);
    }
  };

  const handleUpdate = async (data: PromptFormData) => {
    if (!selectedPrompt) return;

    const result = await updatePrompt({
      id: selectedPrompt.id,
      ...data,
    });

    if (result.success) {
      toast.success("Prompt updated successfully!");
      setViewMode("list");
      setSelectedPrompt(null);
      await loadPrompts();
    } else {
      const errorMsg = typeof result.error === 'string' ? result.error : result.error?.message ?? 'Failed to update prompt';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deletePrompt(id);

    if (result.success) {
      toast.success("Prompt deleted successfully!");
      await loadPrompts();
    } else {
      const errorMsg = typeof result.error === 'string' ? result.error : result.error?.message ?? 'Failed to delete prompt';
      toast.error(errorMsg);
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setViewMode("edit");
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedPrompt(null);
  };

  return (
    <Container>
      <div className="mx-auto max-w-6xl space-y-6">
        {viewMode === "list" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Manage Prompts
                </h1>
                <p className="mt-1 text-slate-600">
                  Create, edit, and manage AI prompts for the marketplace
                </p>
              </div>
              <Button
                onClick={() => setViewMode("create")}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <span className="mr-2">+</span>
                Create Prompt
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <PromptList
                prompts={prompts}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}

        {viewMode === "create" && (
          <PromptForm onSubmit={handleCreate} onCancel={handleCancel} />
        )}

        {viewMode === "edit" && selectedPrompt && (
          <PromptForm
            prompt={selectedPrompt}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
          />
        )}
      </div>
    </Container>
  );
}
