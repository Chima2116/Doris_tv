import { FILMMAKERS } from "@/data/mock/filmmakers";
import type { Filmmaker } from "@/data/types";
import { fetchSanityFilmmakers } from "./sanity-filmmakers";
import { filterFilmmakers, filmmakerFilterOptions, type FilmmakerFilters } from "@/data/filmmaker-filters";

export { ACTIVE_SINCE_OPTIONS, filmmakerFilterOptions, filterFilmmakers, type FilmmakerFilters } from "@/data/filmmaker-filters";

/**
 * Published profiles. Studio profiles take precedence over local profiles with the same slug, and
 * keep the local id so existing references (revisions, applications) still resolve.
 */
async function published(): Promise<Filmmaker[]> {
  const remote = await fetchSanityFilmmakers();
  const idBySlug = new Map(FILMMAKERS.map((f) => [f.slug, f.id]));
  const remoteSlugs = new Set(remote.map((f) => f.slug));
  const local = FILMMAKERS.filter((f) => f.publicationStatus === "published" && !remoteSlugs.has(f.slug));
  const merged = [...remote.map((f) => ({ ...f, id: idBySlug.get(f.slug) ?? f.id })), ...local];
  return merged.sort((a, b) => a.name.localeCompare(b.name));
}

/** Every filmmaker regardless of publication status (for admin and client-side overlays). */
export async function getAllFilmmakers(): Promise<Filmmaker[]> {
  return [...(await published()), ...FILMMAKERS.filter((f) => f.publicationStatus !== "published")];
}

export async function getFilmmakers(filters: FilmmakerFilters = {}): Promise<Filmmaker[]> {
  return filterFilmmakers(await published(), filters);
}

export async function getFilmmakerBySlug(slug: string) {
  return (await published()).find((f) => f.slug === slug) ?? null;
}

export async function getFilmmakerSlugs() {
  return (await published()).map((f) => f.slug);
}

export async function getSpotlightFilmmaker() {
  const all = await published();
  return all.find((f) => f.spotlight) ?? all[0] ?? null;
}

export async function getFilmmakerFilterOptions() {
  return filmmakerFilterOptions(await published());
}

export async function getFilmmakersByIds(ids: string[]) {
  const set = new Set(ids);
  return (await published()).filter((f) => set.has(f.id));
}
