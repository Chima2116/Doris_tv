import { getArticles } from "./articles";
import { getFilmmakers } from "./filmmakers";

/**
 * Global search covers Journal articles and Filmmakers ONLY.
 * Community discussions are deliberately excluded (Stage 1 product decision).
 */
export type SearchEntry = {
  type: "journal" | "filmmaker";
  title: string;
  subtitle: string;
  href: string;
  /** Lower-cased text the client matches against. */
  haystack: string;
};

export async function getSearchIndex(): Promise<SearchEntry[]> {
  const [articles, filmmakers] = await Promise.all([getArticles(), getFilmmakers()]);
  return [
    ...articles.map<SearchEntry>((a) => ({
      type: "journal",
      title: a.title,
      subtitle: `${a.category} · ${a.author}`,
      href: `/journal/${a.slug}`,
      haystack: `${a.title} ${a.deck ?? ""} ${a.author} ${a.category}`.toLowerCase(),
    })),
    ...filmmakers.map<SearchEntry>((f) => ({
      type: "filmmaker",
      title: f.name,
      subtitle: `${f.primaryDiscipline} · ${f.country}`,
      href: `/filmmakers/${f.slug}`,
      haystack: `${f.name} ${f.country} ${f.primaryDiscipline} ${f.location ?? ""}`.toLowerCase(),
    })),
  ];
}
