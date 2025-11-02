import { cn } from "~/lib/utils";

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full relative", className)}
      style={{
        maxWidth: "var(--page-max)",
        paddingLeft: "var(--page-gutter)",
        paddingRight: "var(--page-gutter)",
      }}
      {...props}
    />
  );
}
