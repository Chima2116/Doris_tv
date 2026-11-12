import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
  tone = "gold",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "gold" | "muted";
}) {
  return (
    <p
      className={cn(
        "type-eyebrow",
        tone === "gold" ? "text-gold" : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
