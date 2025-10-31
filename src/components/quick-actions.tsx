"use client";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { QUICK_ACTIONS } from "~/lib/placeholder-data";

interface QuickActionsProps {
  onActionClick?: (action: (typeof QUICK_ACTIONS)[0]) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <section className="py-8">
      <div className="container-tight">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Quick Start</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Card
              key={action.id}
              className="group focus-visible:ring-brand-500/50 cursor-pointer transition-all hover:shadow-lg focus-visible:ring-2"
              onClick={() => onActionClick?.(action)}
              tabIndex={0}
              role="button"
              aria-label={`Use ${action.title} prompt`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{action.icon}</div>
                  <CardTitle className="group-hover:text-brand-700 text-lg text-slate-900">
                    {action.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-slate-600">
                  {action.description}
                </CardDescription>
                <Button
                  size="sm"
                  className="bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500/50 mt-3 w-full text-slate-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionClick?.(action);
                  }}
                >
                  Use This
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
