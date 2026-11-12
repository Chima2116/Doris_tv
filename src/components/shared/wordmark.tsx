import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * DORIS tv logo (supplied artwork). The interface is dark, so it uses the reversed version
 * (white letters; the colour streak is unchanged). `public/brand/doris-logo-light.png` is the
 * original black-on-white version for light backgrounds, and `doris-mark*.png` is the D.tv mark.
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
  const heights = { sm: "h-7", md: "h-9", lg: "h-12" };
  const inner = (
    <Image
      src="/brand/doris-logo.png"
      alt={asLink ? "DORIS tv" : "DORIS tv logo"}
      width={1600}
      height={328}
      priority
      sizes="160px"
      className={cn("w-auto", heights[size], className)}
    />
  );
  if (!asLink) return inner;
  return (
    <Link href="/" aria-label="DORIS tv home" className="inline-block">
      {inner}
    </Link>
  );
}
