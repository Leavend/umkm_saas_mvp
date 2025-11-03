import { cn } from "~/lib/utils";

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative mx-auto w-full", className)}
      style={{
        maxWidth: "var(--page-max)",
        paddingLeft: "var(--page-gutter)",
        paddingRight: "var(--page-gutter)",
      }}
      {...props}
    />
  );
}
