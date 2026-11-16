import { getArticles } from "@/data/repositories/articles";
import { getDiscussions } from "@/data/repositories/discussions";
import { getSpotlightFilmmaker } from "@/data/repositories/filmmakers";
import { getCollections } from "@/data/repositories/collections";
import { getHomeCopy } from "@/data/repositories/site-copy";
import { articleImage } from "@/features/journal/article-image";
import { Collections, Community, FeaturedEditorial, FilmmakerSpotlight, Hero, Invitation, JournalRail } from "@/features/home/home-sections";

export default async function HomePage() {
  const [articles, spotlight, discussions, copy, collections] = await Promise.all([
    getArticles(),
    getSpotlightFilmmaker(),
    getDiscussions(),
    getHomeCopy(),
    getCollections(),
  ]);

  // The featured story is the one ticked "Feature on the Journal front page" in the Studio.
  // The supporting stories are the newest others.
  const featured = articles.find((a) => a.featured) ?? null;
  const supporting = articles.filter((a) => a.slug !== featured?.slug).slice(0, 3);
  const used = new Set([featured?.slug, ...supporting.map((s) => s.slug)]);
  const rail = articles.filter((a) => !used.has(a.slug)).sort((a, b) => Number(!!articleImage(b)) - Number(!!articleImage(a))).slice(0, 7);

  const discussion = discussions[0];
  const recent = discussions.slice(1, 5);
  const counts = new Map<string, number>();
  for (const d of discussions) counts.set(d.category, (counts.get(d.category) ?? 0) + 1);
  const topics = [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const memberIds = [...new Set(discussions.map((d) => d.authorId))];

  return (
    <>
      <Hero copy={copy} />
      <JournalRail stories={rail} />
      {featured && <FeaturedEditorial story={featured} supporting={supporting} />}
      <Collections articles={articles} collections={collections} />
      {spotlight && <FilmmakerSpotlight filmmaker={spotlight} />}
      {discussion && <Community featured={discussion} recent={recent} topics={topics} memberIds={memberIds} />}
      <Invitation copy={copy} />
    </>
  );
}
