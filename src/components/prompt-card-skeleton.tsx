import { Card, CardFooter, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function PromptCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden border border-slate-200 bg-white">
      {/* Image skeleton */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Content skeleton */}
      <CardHeader className="flex-1">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>

      {/* Footer skeleton */}
      <CardFooter className="pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}
