import Link from "next/link";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./eyebrow";

export function SectionHeader({
  title,
  eyebrow,
  action,
  as: Heading = "h2",
  className,
}: {
  title: string;
  eyebrow?: string;
  action?: { label: string; href: string };
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-4 sm:mb-10", className)}>
      <div className="space-y-2">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading className="type-display-md">{title}</Heading>
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 border-b border-transparent pb-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-gold hover:text-gold"
        >
          {action.label} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
