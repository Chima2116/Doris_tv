import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import type { Filmmaker } from "@/data/types";

const PLATE_TONES = ["bg-[#222]", "bg-[#2b2620]", "bg-[#1b2226]", "bg-[#241f27]", "bg-[#1f2620]"];
const toneFor = (slug: string) => PLATE_TONES[[...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0) % PLATE_TONES.length];

/**
 * Portrait slot. With a supplied portrait it shows the photograph; until then it is an honest
 * typographic plate (initials, labelled "Portrait to be supplied"). Never a stock face.
 */
export function FilmmakerPortrait({
  filmmaker,
  aspect = "aspect-[4/5]",
  className,
  priority,
  sizes,
  labelled = true,
}: {
  filmmaker: Filmmaker;
  aspect?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  labelled?: boolean;
}) {
  if (filmmaker.portraitUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-[#161616]", aspect, className)}>
        <Image src={filmmaker.portraitUrl} alt={filmmaker.portraitAlt} fill priority={priority} sizes={sizes ?? "50vw"} className="object-cover" />
      </div>
    );
  }
  return (
    <div role="img" aria-label={`${filmmaker.name}: portrait to be supplied`} className={cn("relative flex items-center justify-center overflow-hidden", toneFor(filmmaker.slug), aspect, className)}>
      <span aria-hidden="true" className="select-none text-[clamp(4rem,9vw,8rem)] font-black leading-none tracking-[-0.06em] text-white/90">{initials(filmmaker.name)}</span>
      {labelled && <span aria-hidden="true" className="absolute bottom-3 left-3 text-[0.6875rem] font-medium text-white/45">Portrait to be supplied</span>}
    </div>
  );
}

export function FilmmakerCard({ filmmaker, className }: { filmmaker: Filmmaker; className?: string }) {
  const inProduction = filmmaker.credits.some((c) => c.inProduction);
  return (
    <Link href={`/filmmakers/${filmmaker.slug}`} className={cn("group block", className)}>
      <div className="relative overflow-hidden">
        <FilmmakerPortrait
          filmmaker={filmmaker}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        {inProduction && (
          <span className="tag absolute right-3 top-3 inline-flex items-center gap-1.5 bg-black/70 px-2 py-1 text-white">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
            In production
          </span>
        )}
      </div>
      <div className="pt-4">
        <h3 className="heading-card flex items-start justify-between gap-2 text-lg leading-tight group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
          {filmmaker.name}
          <ArrowUpRight className="mt-1 size-4 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
        </h3>
        <p className="tag mt-2 text-white/70">{filmmaker.primaryDiscipline}</p>
        <p className="meta mt-1 text-white/55">
          {filmmaker.location ? `${filmmaker.location}, ` : ""}
          {filmmaker.country}
        </p>
      </div>
    </Link>
  );
}
