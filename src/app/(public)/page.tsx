import { Suspense } from "react";
import { getArticles } from "@/data/repositories/articles";
import { getDiscussions } from "@/data/repositories/discussions";
import { getFilmmakerBySlug, getSpotlightFilmmaker } from "@/data/repositories/filmmakers";
import { getCollections } from "@/data/repositories/collections";
import { getHomeCopy } from "@/data/repositories/site-copy";
import { articleImage } from "@/features/journal/article-image";
import { Collections, Community, CommunityTopics, FeaturedEditorial, FilmmakerSpotlight, Hero, Invitation, JournalRail } from "@/features/home/home-sections";

async function HomeContent() {
  const [articles, discussions, copy, collections] = await Promise.all([getArticles(), getDiscussions(), getHomeCopy(), getCollections()]);

  // Everything here is chosen in the Studio's Home page document. Where a choice is empty, the
  // fallback is the story flagged "Feature on the Journal front page", the newest other stories,
  // or the filmmaker ticked for the homepage spotlight.
  const bySlug = (slug: string) => articles.find((a) => a.slug === slug);
  const featured = (copy.featuredSlug ? bySlug(copy.featuredSlug) : undefined) ?? articles.find((a) => a.featured) ?? null;
  const chosen = copy.supportingSlugs.map(bySlug).filter((a): a is NonNullable<typeof a> => Boolean(a) && a?.slug !== featured?.slug);
  const supporting = (chosen.length ? chosen : articles.filter((a) => a.slug !== featured?.slug)).slice(0, 3);
  const used = new Set([featured?.slug, ...supporting.map((s) => s.slug)]);
  const rail = articles.filter((a) => !used.has(a.slug)).sort((a, b) => Number(!!articleImage(b)) - Number(!!articleImage(a))).slice(0, 7);

  const spotlight = (copy.spotlightFilmmakerSlug ? await getFilmmakerBySlug(copy.spotlightFilmmakerSlug) : null) ?? (await getSpotlightFilmmaker());

  const discussion = discussions[0];
  const recent = discussions.slice(1, 5);
  const memberIds = [...new Set(discussions.map((d) => d.authorId))];

  return (
    <>
      <Hero copy={copy} />
      <JournalRail stories={rail} heading={copy.railHeading} />
      {featured && <FeaturedEditorial story={featured} supporting={supporting} label={copy.featuredLabel} />}
      <Collections articles={articles} collections={collections} heading={copy.collectionsHeading} intro={copy.collectionsIntro} />
      {spotlight && <FilmmakerSpotlight filmmaker={spotlight} label={copy.spotlightLabel} />}
      {discussion ? (
        <Community featured={discussion} recent={recent} topics={copy.communityTopics} memberIds={memberIds} heading={copy.communityHeading} intro={copy.communityIntro} />
      ) : (
        <CommunityTopics heading={copy.communityHeading} intro={copy.communityIntro} topics={copy.communityTopics} />
      )}
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
