import { Suspense } from "react";
import { getArticles } from "@/data/repositories/articles";
import { getDiscussions } from "@/data/repositories/discussions";
import { getSpotlightFilmmaker } from "@/data/repositories/filmmakers";
import { getCollections } from "@/data/repositories/collections";
import { getHomeCopy } from "@/data/repositories/site-copy";
import { articleImage } from "@/features/journal/article-image";
import { Collections, Community, FeaturedEditorial, FilmmakerSpotlight, Hero, Invitation, JournalRail } from "@/features/home/home-sections";

async function HomeContent() {
  const [articles, spotlight, discussions, copy, collections] = await Promise.all([
    getArticles(),
    getSpotlightFilmmaker(),
    getDiscussions(),
    getHomeCopy(),
    getCollections(),
  ]);

  // The featured story and supporting stories come from the Studio. If none are chosen, the story
  // flagged "Feature on the Journal front page" is used, and the supporting stories are the newest others.
  const bySlug = (slug: string) => articles.find((a) => a.slug === slug);
  const chosenFeatured = copy.featuredSlug ? bySlug(copy.featuredSlug) : undefined;
  const featured = chosenFeatured ?? articles.find((a) => a.featured) ?? null;
  const chosenSupporting = copy.supportingSlugs.map(bySlug).filter((a): a is NonNullable<typeof a> => Boolean(a) && a?.slug !== featured?.slug);
  const supporting = (chosenSupporting.length ? chosenSupporting : articles.filter((a) => a.slug !== featured?.slug)).slice(0, 3);
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
      <JournalRail stories={rail} heading={copy.railHeading} />
      {featured && <FeaturedEditorial story={featured} supporting={supporting} label={copy.featuredLabel} />}
      <Collections articles={articles} collections={collections} heading={copy.collectionsHeading} intro={copy.collectionsIntro} />
      {spotlight && <FilmmakerSpotlight filmmaker={spotlight} />}
      {discussion && <Community featured={discussion} recent={recent} topics={topics} memberIds={memberIds} heading={copy.communityHeading} intro={copy.communityIntro} />}
      <Invitation copy={copy} />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
