import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Art-directed image. No photography has been supplied yet, so when `src` is
 * omitted this renders a deterministic duotone placeholder (tone chosen from
 * `seed`) in the DORIS palette. When real art arrives, pass `src` and nothing
 * else in the UI changes. Alt text is always required.
 */
const TONES = [
  ["#0b1d12", "#2a1a08"], // forest → ember
  ["#0a1226", "#1d2a4d"], // midnight blue
  ["#220c0c", "#4a1d12"], // burnt umber
  ["#0a1f1c", "#143b33"], // deep teal
  ["#241b0a", "#4d3a12"], // ochre
  ["#1e0c24", "#3a1a47"], // plum
  ["#101010", "#2b2b2b"], // graphite
  ["#1a1208", "#3b2a0e"], // sepia
] as const;

function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function ArtImage({
  src,
  alt,
  seed = alt,
  ghost,
  aspect = "aspect-[4/3]",
  className,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  src?: string;
  alt: string;
  seed?: string;
  /** Large ghost lettering for placeholders (initial, numeral…). */
  ghost?: string;
  /** Tailwind aspect utility, e.g. "aspect-[3/4]". Reserves space to avoid layout shift. */
  aspect?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-surface", aspect, className)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const [from, to] = TONES[hash(seed) % TONES.length];
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("relative isolate overflow-hidden", aspect, className)}
      style={{ backgroundImage: `linear-gradient(155deg, ${from} 0%, ${to} 100%)` }}
    >
      {/* vignette gives the placeholder a cinematic falloff */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 30% 20%, transparent 40%, rgba(0,0,0,.55) 100%)",
        }}
      />
      {ghost && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[8%] -right-[2%] select-none font-display text-[clamp(5rem,28cqw,16rem)] font-black leading-none text-white/[0.05]"
        >
          {ghost}
        </span>
      )}
    </div>
  );
}
