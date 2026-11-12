import Link from "next/link";
import { cn } from "@/lib/utils";

/** URL-driven pagination: preserves other query params so filters stay shareable. */
export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const item =
    "flex h-11 min-w-11 items-center justify-center border px-3 text-xs font-semibold uppercase tracking-[0.08em] transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-14 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} scroll={false} className={cn(item, "border-border hover:border-white")}>
          Previous
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          scroll={false}
          aria-current={p === page ? "page" : undefined}
          aria-label={`Page ${p}`}
          className={cn(
            item,
            p === page ? "border-gold bg-gold text-primary-foreground" : "border-border hover:border-white",
          )}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={href(page + 1)} scroll={false} className={cn(item, "border-border hover:border-white")}>
          Next
        </Link>
      )}
    </nav>
  );
}
