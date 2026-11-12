"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal rail with scroll-snap. Touch devices swipe natively; mouse users can drag or use the
 * arrow buttons; keyboard users reach the buttons and the focusable cards. No autoplay.
 */
export function Carousel({
  children,
  label,
  className,
  trackClassName,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  trackClassName?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  function step(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const w = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * w * 2, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  return (
    <div className={cn("relative", className)} role="group" aria-roledescription="carousel" aria-label={label}>
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={edge.start}
          aria-label={`${label}: previous`}
          className="inline-flex size-10 items-center justify-center border border-white/30 text-white transition-colors hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={edge.end}
          aria-label={`${label}: next`}
          className="inline-flex size-10 items-center justify-center border border-white/30 text-white transition-colors hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      <ul
        ref={track}
        onScroll={measure}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          drag.current = { x: e.clientX, left: track.current?.scrollLeft ?? 0, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !track.current) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4) d.moved = true;
          if (d.moved) track.current.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          // Swallow the click that ends a drag so cards don't navigate.
          const moved = drag.current?.moved;
          drag.current = null;
          if (moved) {
            const stop = (ev: Event) => ev.stopPropagation();
            window.addEventListener("click", stop, { capture: true, once: true });
            setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 0);
          }
        }}
        onPointerLeave={() => (drag.current = null)}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          trackClassName,
        )}
      >
        {children}
      </ul>
    </div>
  );
}

export function CarouselItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={cn("shrink-0 snap-start", className)}>{children}</li>;
}
