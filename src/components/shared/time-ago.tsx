"use client";

import { useSyncExternalStore } from "react";
import { MOCK_NOW, formatDate, timeAgo } from "@/lib/format";

/**
 * Live relative time for client UIs. The server and hydration render against the fixed
 * demo clock (deterministic, prerender-safe); after mount it ticks with the real clock,
 * so content created during a session reads as "just now".
 */
let cached = MOCK_NOW.getTime();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l()), 30_000);
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot() {
  // Rounded to the minute so the snapshot is stable between ticks.
  const t = Math.floor(Math.max(MOCK_NOW.getTime(), Date.now()) / 60_000) * 60_000;
  if (t !== cached) cached = t;
  return cached;
}

export function useNow() {
  return new Date(useSyncExternalStore(subscribe, getSnapshot, () => MOCK_NOW.getTime()));
}

export function TimeAgo({ iso, className }: { iso: string; className?: string }) {
  const now = useNow();
  return (
    <time dateTime={iso} title={formatDate(iso)} className={className}>
      {timeAgo(iso, now)}
    </time>
  );
}
