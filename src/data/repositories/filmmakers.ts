import { FILMMAKERS } from "@/data/mock/filmmakers";
import type { Filmmaker } from "@/data/types";

export type FilmmakerFilters = {
  q?: string;
  country?: string;
  discipline?: string;
  /** Decade the filmmaker became active, e.g. "2010". */
  since?: string;
};

export const ACTIVE_SINCE_OPTIONS = [
  { value: "2020", label: "2020s" },
  { value: "2010", label: "2010s" },
  { value: "2000", label: "2000s" },
] as const;

const published = () =>
  FILMMAKERS.filter((f) => f.publicationStatus === "published").sort((a, b) =>
    a.name.localeCompare(b.name),
  );

/** Every filmmaker regardless of publication status (for admin and client-side overlays). */
export async function getAllFilmmakers(): Promise<Filmmaker[]> {
  return FILMMAKERS;
}

export function filterFilmmakers(list: Filmmaker[], filters: FilmmakerFilters): Filmmaker[] {
  const q = filters.q?.trim().toLowerCase();
  return list.filter((f) => {
    if (q && !f.name.toLowerCase().includes(q)) return false;
    if (filters.country && f.country !== filters.country) return false;
    if (filters.discipline && f.primaryDiscipline !== filters.discipline) return false;
    if (filters.since) {
      const start = Number(filters.since);
      const from = f.activeFrom ?? 0;
      if (from < start || from >= start + 10) return false;
    }
    return true;
  });
}

export async function getFilmmakers(filters: FilmmakerFilters = {}): Promise<Filmmaker[]> {
  return filterFilmmakers(published(), filters);
}

export function filmmakerFilterOptions(list: Filmmaker[]) {
  const uniq = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b));
  return {
    countries: uniq(list.map((f) => f.country)),
    disciplines: uniq(list.map((f) => f.primaryDiscipline)),
    since: ACTIVE_SINCE_OPTIONS,
  };
}

export async function getFilmmakerBySlug(slug: string) {
  return published().find((f) => f.slug === slug) ?? null;
}

export async function getFilmmakerSlugs() {
  return published().map((f) => f.slug);
}

export async function getSpotlightFilmmaker() {
  const all = published();
  return all.find((f) => f.spotlight) ?? all[0] ?? null;
}

export async function getFilmmakerFilterOptions() {
  const all = published();
  const uniq = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b));
  return {
    countries: uniq(all.map((f) => f.country)),
    disciplines: uniq(all.map((f) => f.primaryDiscipline)),
    since: ACTIVE_SINCE_OPTIONS,
  };
}

export async function getFilmmakersByIds(ids: string[]) {
  const set = new Set(ids);
  return published().filter((f) => set.has(f.id));
}
