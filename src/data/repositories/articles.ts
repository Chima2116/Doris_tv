import type { JournalArticle, JournalCategory } from "@/data/types";
import { fetchSanityArticles } from "./sanity-articles";
import { fetchRemoteArticles } from "./remote-stories";

/**
 * Data access for Journal content. Stories come from Sanity, the single source of truth.
 */
async function published(): Promise<JournalArticle[]> {
  const [fromStudio, fromFilmmakers] = await Promise.all([fetchSanityArticles(), fetchRemoteArticles()]);
  return [...fromStudio, ...fromFilmmakers].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getArticles(opts: { category?: JournalCategory } = {}): Promise<JournalArticle[]> {
  const all = await published();
  return opts.category ? all.filter((a) => a.category === opts.category) : all;
}

export async function getArticleBySlug(slug: string) {
  return (await published()).find((a) => a.slug === slug) ?? null;
}

export async function getArticleSlugs() {
  return (await published()).map((a) => a.slug);
}

export async function getFeaturedArticle() {
  const all = await published();
  return all.find((a) => a.featured) ?? all[0] ?? null;
}

export async function getLatestArticles(n: number, excludeSlug?: string) {
  return (await published())
    .filter((a) => a.slug !== excludeSlug && a.category !== "Video")
    .slice(0, n);
}

export async function getRelatedArticles(article: JournalArticle, n = 3) {
  const others = (await published()).filter((a) => a.slug !== article.slug);
  const score = (a: JournalArticle) =>
    (a.category === article.category ? 2 : 0) +
    (a.filmmakerSlugs?.some((s) => article.filmmakerSlugs?.includes(s)) ? 3 : 0);
  return others.sort((a, b) => score(b) - score(a)).slice(0, n);
}

export async function getArticlesForFilmmaker(slug: string) {
  return (await published()).filter((a) => a.filmmakerSlugs?.includes(slug));
}

export async function getArticlesBySlugs(slugs: string[]) {
  const set = new Set(slugs);
  return (await published()).filter((a) => set.has(a.slug));
}
