import { getArticles } from "@/data/repositories/articles";
import { getDiscussions } from "@/data/repositories/discussions";
import { getCollections } from "@/data/repositories/collections";
import { getSpotlightFilmmaker } from "@/data/repositories/filmmakers";
import { getHomeCopy } from "@/data/repositories/site-copy";
import { articleImage } from "@/features/journal/article-image";
import { Collections, Community, FeaturedEditorial, FilmmakerSpotlight, Hero, Invitation, JournalRail } from "@/features/home/home-sections";

export default async function HomePage() {
  const [articles, spotlight, discussions, copy, collections] = await Promise.all([getArticles(), getSpotlightFilmmaker(), getDiscussions(), getHomeCopy(), getCollections()]);
  const bySlug = (slug: string) => articles.find((a) => a.slug === slug);
  const featured = bySlug("who-gets-to-see-african-films");
  const supporting = ["against-resolution-the-unfinished-frame", "dakar-film-clubs-a-short-history", "northern-voices-five-films-hausa-cinema"]
    .map(bySlug)
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const used = new Set([featured?.slug, ...supporting.map((s) => s.slug)]);
  const rail = articles.filter((a) => !used.has(a.slug)).sort((a, b) => Number(!!articleImage(b)) - Number(!!articleImage(a))).slice(0, 7);

  const discussion = discussions.find((d) => d.id === "d_04") ?? discussions[0];
  const recent = discussions.filter((d) => d.id !== discussion.id).slice(0, 4);
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
      <Community featured={discussion} recent={recent} topics={topics} memberIds={memberIds} />
      <Invitation copy={copy} />
    </>
  );
}
