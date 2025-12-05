import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Icon } from "~/lib/icons";
import { Loader2 } from "lucide-react";
import { PromptList } from "~/components/admin/prompt-list";
import { PromptForm, type PromptFormData } from "~/components/admin/prompt-form";
import type { Prompt } from "@prisma/client";

type ViewMode = "list" | "create" | "edit";

export function AdminHeader({
    viewMode,
    lang,
    pendingCount,
    setViewMode,
}: {
    viewMode: ViewMode;
    lang: string;
    pendingCount: number;
    setViewMode: (mode: ViewMode) => void;
}) {
    if (viewMode !== "list") return null;

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Manage Prompts</h1>
                <p className="mt-1 text-slate-600">
                    Create, edit, and manage AI prompts for the marketplace
                </p>
            </div>
            <div className="flex items-center gap-3">
                <RequestsButton lang={lang} count={pendingCount} />
                <Button
                    onClick={() => setViewMode("create")}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                >
                    <span className="mr-2">+</span>
                    Create Prompt
                </Button>
            </div>
        </div>
    );
}

function RequestsButton({ lang, count }: { lang: string; count: number }) {
    return (
        <Link href={`/${lang}/admin/requests`}>
            <Button variant="outline" className="relative gap-2">
                <Icon name="FileText" className="h-4 w-4" />
                Requests
                {count > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </Button>
        </Link>
    );
}

export function AdminContent({
    viewMode,
    isLoading,
    prompts,
    selectedPrompt,
    onEdit,
    onDelete,
    onCreate,
    onUpdate,
    onCancel,
}: {
    viewMode: ViewMode;
    isLoading: boolean;
    prompts: Prompt[];
    selectedPrompt: Prompt | null;
    onEdit: (prompt: Prompt) => void;
    onDelete: (id: string) => void;
    onCreate: (data: PromptFormData) => Promise<void>;
    onUpdate: (data: PromptFormData) => Promise<void>;
    onCancel: () => void;
}) {
    if (viewMode === "list") {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            );
        }
        return (
            <PromptList prompts={prompts} onEdit={onEdit} onDelete={onDelete} />
        );
    }

    if (viewMode === "create") {
        return <PromptForm onSubmit={onCreate} onCancel={onCancel} />;
    }

    if (viewMode === "edit" && selectedPrompt) {
        return (
            <PromptForm
                prompt={selectedPrompt}
                onSubmit={onUpdate}
                onCancel={onCancel}
            />
        );
    }

    return null;
}
