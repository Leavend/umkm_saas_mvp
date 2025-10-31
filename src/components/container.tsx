import { cn } from "~/lib/utils";

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full", className)}
      style={{
        maxWidth: "var(--container-max)",
        paddingLeft: "var(--container-gutter)",
        paddingRight: "var(--container-gutter)",
      }}
      {...props}
    />
  );
}
