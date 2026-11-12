import Link from "next/link";
import { ArtImage } from "@/components/shared/art-image";
import { cn } from "@/lib/utils";
import type { Filmmaker } from "@/data/types";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

export function FilmmakerPortrait({
  filmmaker,
  aspect = "aspect-[3/4]",
  className,
  priority,
  sizes,
}: {
  filmmaker: Filmmaker;
  aspect?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <ArtImage
      src={filmmaker.portraitUrl || undefined}
      alt={filmmaker.portraitAlt}
      seed={filmmaker.slug}
      ghost={initials(filmmaker.name)}
      aspect={aspect}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}

export function FilmmakerCard({ filmmaker, className }: { filmmaker: Filmmaker; className?: string }) {
  const inProduction = filmmaker.credits.some((c) => c.inProduction);
  return (
    <Link
      href={`/filmmakers/${filmmaker.slug}`}
      className={cn("group block border border-transparent transition-colors hover:border-border", className)}
    >
      <div className="relative overflow-hidden">
        <FilmmakerPortrait
          filmmaker={filmmaker}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        {inProduction && (
          <span className="absolute left-3 top-3 bg-gold px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-primary-foreground">
            In production
          </span>
        )}
      </div>
      <div className="p-3 pb-4 sm:p-4">
        <h3 className="font-display text-lg font-black leading-tight group-hover:text-gold">
          {filmmaker.name}
        </h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-gold">
          {filmmaker.primaryDiscipline}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {filmmaker.location ? `${filmmaker.location}, ` : ""}
          {filmmaker.country}
        </p>
      </div>
    </Link>
  );
}
