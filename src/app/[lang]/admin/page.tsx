"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Prompt } from "@prisma/client";
import { Container } from "~/components/container";
import { type PromptFormData } from "~/components/admin/prompt-form";
import { toast } from "sonner";
import { useTranslations } from "~/components/language-provider";
import {
  createPrompt,
  updatePrompt,
  deletePrompt,
  getAllPromptsAdmin,
} from "~/actions/admin-prompts";
import { getPendingRequestsCount } from "~/actions/prompt-requests";
import { AdminHeader, AdminContent } from "./admin-parts";

type ViewMode = "list" | "create" | "edit";

export default function AdminPage() {
  const params = useParams();
  const lang = (params.lang as string) || "en";
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const translations = useTranslations();

  useEffect(() => {
    void loadPrompts();
    void loadPendingCount();
  }, []);

  const loadPrompts = async () => {
    setIsLoading(true);
    const result = await getAllPromptsAdmin();

    if (result.success && result.data) {
      setPrompts(result.data.prompts);
    } else {
      const errorMsg =
        typeof result.error === "string"
          ? result.error
          : (result.error?.message ?? "Failed to load prompts");
      toast.error(errorMsg);
    }
    setIsLoading(false);
  };

  const loadPendingCount = async () => {
    const result = await getPendingRequestsCount();
    if (result.success && result.data) {
      setPendingCount(result.data.count);
    }
  };

  const handleCreate = async (data: PromptFormData) => {
    const result = await createPrompt(data);

    if (result.success) {
      toast.success(translations.admin.toast.promptCreated);
      setViewMode("list");
      await loadPrompts();
    } else {
      const errorMsg =
        typeof result.error === "string"
          ? result.error
          : (result.error?.message ?? "Failed to create prompt");
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
      toast.success(translations.admin.toast.promptUpdated);
      setViewMode("list");
      setSelectedPrompt(null);
      await loadPrompts();
    } else {
      const errorMsg =
        typeof result.error === "string"
          ? result.error
          : (result.error?.message ?? "Failed to update prompt");
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deletePrompt(id);

    if (result.success) {
      toast.success(translations.admin.toast.promptDeleted);
      await loadPrompts();
    } else {
      const errorMsg =
        typeof result.error === "string"
          ? result.error
          : (result.error?.message ?? "Failed to delete prompt");
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
        <AdminHeader
          viewMode={viewMode}
          lang={lang}
          pendingCount={pendingCount}
          setViewMode={setViewMode}
        />

        <AdminContent
          viewMode={viewMode}
          isLoading={isLoading}
          prompts={prompts}
          selectedPrompt={selectedPrompt}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
        />
      </div>
    </Container>
  );
}
