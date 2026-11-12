"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

type Item = { href: string; label: string };
type Props = {
  items: readonly Item[];
  className?: string;
  linkClassName?: string;
  inactiveClassName?: string;
  onNavigate?: () => void;
};

function List({ pathname, items, className, linkClassName, inactiveClassName, onNavigate }: Props & { pathname: string }) {
  return (
    <ul className={className}>
      {items.map((item) => {
        const active = !!pathname && isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
                active ? "text-gold" : inactiveClassName,
                linkClassName,
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function WithPath(props: Props) {
  return <List {...props} pathname={usePathname()} />;
}

/**
 * Nav list with active-route highlighting. The pathname is runtime data, so it's read
 * inside Suspense: the static shell renders the links un-highlighted, then the active
 * state streams in. This keeps dynamic routes (e.g. /community/[thread-id]) prerenderable.
 */
export function NavLinks({
  inactiveClassName = "text-muted-foreground hover:text-foreground",
  ...rest
}: Props) {
  const props = { ...rest, inactiveClassName };
  return (
    <Suspense fallback={<List {...props} pathname="" />}>
      <WithPath {...props} />
    </Suspense>
  );
}
