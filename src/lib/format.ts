/**
 * Deterministic formatting. "Now" is fixed for the prototype so server and client
 * render identical output (no hydration mismatch) and the mock timeline stays coherent.
 */
export const MOCK_NOW = new Date("2026-11-11T12:00:00Z");

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    ...opts,
  }).format(new Date(iso));
}

export const formatShortDate = (iso: string) =>
  formatDate(iso, { day: "numeric", month: "short", year: undefined });

/** Relative time. Deterministic by default (server/prerender safe); client UIs pass a live `now`. */
export function timeAgo(iso: string, now: Date = MOCK_NOW) {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(iso, { year: undefined });
}

export const readingLabel = (a: { category: string; readingTime: number }) =>
  a.category === "Video" ? `${a.readingTime} min watch` : `${a.readingTime} min read`;
