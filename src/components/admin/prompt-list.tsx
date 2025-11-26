"use client";

import { useState } from "react";
import type { Prompt } from "@prisma/client";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";

interface PromptListProps {
  prompts: Prompt[];
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

export function PromptList({ prompts, onEdit, onDelete }: PromptListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPrompts = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) {
      return;
    }

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts by title, category, or text..."
            className="border-slate-300 pl-10"
          />
        </div>
        <p className="text-sm text-slate-500">
          {filteredPrompts.length} of {prompts.length} prompts
        </p>
      </div>

      <div className="grid gap-4">
        {filteredPrompts.length === 0 ? (
          <Card className="border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-slate-500">
              {searchQuery
                ? "No prompts found matching your search"
                : "No prompts yet. Create your first one!"}
            </p>
          </Card>
        ) : (
          filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="border-slate-200 bg-white transition-shadow hover:shadow-md"
            >
              <div className="flex gap-4 p-4">
                <div className="relative h-32 w-48 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={prompt.imageUrl}
                    alt={prompt.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {prompt.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="mt-1 bg-blue-50 text-blue-700"
                      >
                        {prompt.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(prompt)}
                        className="h-9 w-9 border-slate-300 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <span>✏️</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(prompt.id)}
                        disabled={deletingId === prompt.id}
                        className="h-9 w-9 border-slate-300 hover:bg-red-50 hover:text-red-600"
                      >
                        {deletingId === prompt.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span>🗑️</span>
                        )}
                      </Button>
                    </div>
                  </div>

                  <p className="flex-1 text-sm text-slate-600 line-clamp-2">
                    {prompt.text}
                  </p>

                  <div className="mt-2 flex gap-4 text-xs text-slate-400">
                    <span>ID: {prompt.id}</span>
                    <span>
                      Created: {new Date(prompt.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Updated: {new Date(prompt.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
