import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Icon } from "~/lib/icons";
import { Send, Check, Copy, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface PromptInfoSectionProps {
    category: string;
    text: string;
    isLoading: boolean;
    status: string;
    translations: any;
    onClose: () => void;
    onGenerate: () => void;
    onCopy: () => void;
}

export function PromptInfoSection({
    category,
    text,
    isLoading,
    status,
    translations,
    onClose,
    onGenerate,
    onCopy,
}: PromptInfoSectionProps) {
    return (
        <div className="flex flex-1 flex-col md:w-1/2">
            <PromptHeader
                category={category}
                onClose={onClose}
                closeLabel={translations.common.actions.close || "Tutup"}
                isLoading={isLoading}
            />
            <PromptDescription text={text} />
            <PromptActions
                isLoading={isLoading}
                status={status}
                translations={translations}
                onGenerate={onGenerate}
                onCopy={onCopy}
            />
        </div>
    );
}

function PromptHeader({
    category,
    onClose,
    closeLabel,
    isLoading,
}: {
    category: string;
    onClose: () => void;
    closeLabel: string;
    isLoading: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-slate-900 text-xs text-white">
                    ● {category}
                </Badge>
            </div>
            <button
                onClick={onClose}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                disabled={isLoading}
            >
                {closeLabel}
            </button>
        </div>
    );
}

function PromptDescription({ text }: { text: string }) {
    return (
        <div className="flex-1 overflow-y-auto p-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <p className="font-mono text-sm leading-relaxed text-slate-800">
                    {text}
                </p>
            </div>
        </div>
    );
}

function PromptActions({
    isLoading,
    status,
    translations,
    onGenerate,
    onCopy,
}: {
    isLoading: boolean;
    status: string;
    translations: any;
    onGenerate: () => void;
    onCopy: () => void;
}) {
    return (
        <div className="flex items-center gap-3 border-t border-slate-200 p-4">
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onGenerate}
            >
                <Send className="h-4 w-4" />
                {translations.common.actions.goToGenerate || "Generate"}
            </Button>

            <span className="flex-1 text-xs text-slate-500">
                Tanpa limit. Tanpa watermark.
            </span>

            <Button
                size="sm"
                className={cn(
                    "gap-2",
                    status === "copied"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-brand-500 hover:bg-brand-600 text-slate-900",
                )}
                disabled={isLoading || status === "copied"}
                onClick={onCopy}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {translations.promptCard.copying}
                    </>
                ) : status === "copied" ? (
                    <>
                        <Check className="h-4 w-4" />
                        {translations.promptCard.copied}
                    </>
                ) : (
                    <>
                        <Copy className="h-4 w-4" />
                        {translations.promptCard.copyPrompt}
                    </>
                )}
            </Button>
        </div>
    );
}
