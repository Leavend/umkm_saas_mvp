import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Send, Check, Copy, Loader2, X } from "lucide-react";
import { cn } from "~/lib/utils";

interface PromptInfoSectionProps {
    title: string;
    category: string;
    text: string;
    sequenceNumber?: number;
    isLoading: boolean;
    status: string;
    translations: any;
    onClose: () => void;
    onGenerate: () => void;
    onCopy: () => void;
}

export function PromptInfoSection({
    title,
    category,
    text,
    sequenceNumber,
    isLoading,
    status,
    translations,
    onClose,
    onGenerate,
    onCopy,
}: PromptInfoSectionProps) {
    return (
        <div className="relative flex flex-1 flex-col md:w-1/2">
            <CloseButton onClose={onClose} isLoading={isLoading} />
            <PromptHeader title={title} category={category} sequenceNumber={sequenceNumber} />
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

function CloseButton({ onClose, isLoading }: { onClose: () => void; isLoading: boolean }) {
    return (
        <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
        >
            <X className="h-5 w-5" />
        </button>
    );
}

function PromptHeader({
    title,
    category,
    sequenceNumber,
}: {
    title: string;
    category: string;
    sequenceNumber?: number;
}) {
    return (
        <div className="space-y-3 border-b border-slate-100 p-5 pr-12">
            <Badge variant="secondary" className="bg-slate-900 text-xs text-white">
                ● {category}
            </Badge>
            <h2 className="text-xl font-bold leading-tight text-slate-900">{title}</h2>
            {sequenceNumber && (
                <p className="text-xs text-slate-400">#{sequenceNumber}</p>
            )}
        </div>
    );
}

function PromptDescription({ text }: { text: string }) {
    return (
        <div className="flex-1 overflow-y-auto p-5">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700">
                    {text}
                </pre>
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
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4">
            <Button variant="outline" size="sm" className="gap-2" onClick={onGenerate}>
                <Send className="h-4 w-4" />
                {translations.common.actions.goToGenerate || "Generate"}
            </Button>
            <span className="flex-1 text-xs text-slate-400">
                Tanpa limit. Tanpa watermark.
            </span>
            <CopyButton isLoading={isLoading} status={status} translations={translations} onCopy={onCopy} />
        </div>
    );
}

function CopyButton({
    isLoading,
    status,
    translations,
    onCopy,
}: {
    isLoading: boolean;
    status: string;
    translations: any;
    onCopy: () => void;
}) {
    const isCopied = status === "copied";
    return (
        <Button
            size="sm"
            className={cn(
                "gap-2 shadow-sm",
                isCopied
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-amber-400 text-slate-900 hover:bg-amber-500",
            )}
            disabled={isLoading || isCopied}
            onClick={onCopy}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {translations.promptCard.copying}
                </>
            ) : isCopied ? (
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
    );
}

