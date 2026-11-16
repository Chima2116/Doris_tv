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

export function filmmakerFilterOptions(list: Filmmaker[]) {
  const uniq = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b));
  return {
    countries: uniq(list.map((f) => f.country)),
    disciplines: uniq(list.map((f) => f.primaryDiscipline)),
    since: ACTIVE_SINCE_OPTIONS,
  };
}
