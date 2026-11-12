import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Working wordmark ("DORIS. TV" is placeholder artwork in the Brand Bible).
 * Swap this component's internals when final artwork is supplied.
 */
export function Wordmark({
  className,
  asLink = true,
  size = "md",
}: {
  className?: string;
  asLink?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-lg", md: "text-[1.35rem]", lg: "text-3xl" };
  const inner = (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 font-display font-black leading-none tracking-[0.08em] text-foreground",
        sizes[size],
        className,
      )}
    >
      <span>
        DORIS<span className="text-gold">.</span>
      </span>
      <span className="text-[0.5em] font-bold tracking-[0.3em] text-muted-foreground">TV</span>
    </span>
  );
  if (!asLink) return inner;
  return (
    <Link href="/" aria-label="DORIS TV home" className="inline-block">
      {inner}
    </Link>
  );
}
