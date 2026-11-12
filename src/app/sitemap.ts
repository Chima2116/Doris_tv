import type { MetadataRoute } from "next";
import { getArticleSlugs } from "@/data/repositories/articles";
import { getDiscussions } from "@/data/repositories/discussions";
import { getFilmmakerSlugs } from "@/data/repositories/filmmakers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, filmmakers, discussions] = await Promise.all([getArticleSlugs(), getFilmmakerSlugs(), getDiscussions()]);
  const fixed = ["", "/about", "/journal", "/filmmakers", "/community", "/waitlist"];
  return [
    ...fixed.map((p) => ({ url: `${SITE_URL}${p}`, priority: p === "" ? 1 : 0.8 })),
    ...articles.map((s) => ({ url: `${SITE_URL}/journal/${s}`, priority: 0.7 })),
    ...filmmakers.map((s) => ({ url: `${SITE_URL}/filmmakers/${s}`, priority: 0.7 })),
    ...discussions.map((d) => ({ url: `${SITE_URL}/community/${d.id}`, priority: 0.5 })),
  ];
}
