import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
  as: Heading = "h2",
}: {
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
  icon?: React.ReactNode;
  className?: string;
  /** Heading level. Defaults to h2 so it never skips a level under the page h1. */
  as?: "h2" | "h3";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      {icon && <div className="mb-4 text-gold [&_svg]:size-8">{icon}</div>}
      <Heading className="font-display text-xl font-black">{title}</Heading>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action &&
        (action.href ? (
          <Button asChild variant="outline" className="mt-6">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button variant="outline" className="mt-6" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}
