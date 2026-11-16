import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { sanityClient, sanityConfigured, imageUrl } from "../../../sanity/client";
import { ABOUT_COPY, HOME_COPY, type AboutCopy, type HomeCopy } from "@/data/copy/site-copy";

/** Keeps a Studio value only when it is filled in; otherwise the built-in copy stays. */
const pick = <T extends string>(studio: T | null | undefined, fallback: T): T =>
  typeof studio === "string" && studio.trim() !== "" ? (studio as T) : fallback;

/** The video ID from a YouTube link, or "" if the link is not a YouTube link. */
export function youtubeId(url: string | null | undefined): string {
  if (!url) return "";
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : "";
}

async function fetchDocument<T>(type: string, projection = ""): Promise<(Partial<T> & Record<string, unknown>) | null> {
  "use cache";
  cacheLife("minutes");
  if (!sanityConfigured) return null;
  try {
    return await sanityClient.fetch<(Partial<T> & Record<string, unknown>) | null>(`*[_type == $type][0]${projection}`, { type });
  } catch (err) {
    console.error(`Sanity: could not load ${type}, using built-in copy`, err);
    return null;
  }
}

const HOME_PROJECTION = ` {
  heroEyebrow, heroHeadline, heroIntro, heroPrimaryLabel, heroSecondaryLabel,
  heroImage, heroVideoUrl,
  railHeading, featuredLabel,
  "featuredSlug": featuredStory->slug.current,
  "supportingSlugs": supportingStories[]->slug.current,
  collectionsHeading, collectionsIntro,
  communityHeading, communityIntro,
  invitationHeadline, invitationText
}`;

/** Read on every visit, so a publish in the Studio shows on the home page straight away. */
async function fetchHomeDocument(): Promise<(Partial<HomeCopy> & Record<string, unknown>) | null> {
  await connection();
  if (!sanityConfigured) return null;
  try {
    return await sanityClient.fetch(`*[_type == "homePage"][0]` + HOME_PROJECTION);
  } catch (err) {
    console.error("Sanity: could not load home page, using built-in copy", err);
    return null;
  }
}

export async function getHomeCopy(): Promise<HomeCopy> {
  const d = await fetchHomeDocument();
  const supporting = ((d?.supportingSlugs as string[] | undefined) ?? []).filter(Boolean);
  return {
    heroEyebrow: pick(d?.heroEyebrow as string, HOME_COPY.heroEyebrow),
    heroHeadline: pick(d?.heroHeadline as string, HOME_COPY.heroHeadline),
    heroIntro: pick(d?.heroIntro as string, HOME_COPY.heroIntro),
    heroPrimaryLabel: pick(d?.heroPrimaryLabel as string, HOME_COPY.heroPrimaryLabel),
    heroSecondaryLabel: pick(d?.heroSecondaryLabel as string, HOME_COPY.heroSecondaryLabel),
    railHeading: pick(d?.railHeading as string, HOME_COPY.railHeading),
    featuredLabel: pick(d?.featuredLabel as string, HOME_COPY.featuredLabel),
    collectionsHeading: pick(d?.collectionsHeading as string, HOME_COPY.collectionsHeading),
    collectionsIntro: pick(d?.collectionsIntro as string, HOME_COPY.collectionsIntro),
    communityHeading: pick(d?.communityHeading as string, HOME_COPY.communityHeading),
    communityIntro: pick(d?.communityIntro as string, HOME_COPY.communityIntro),
    invitationHeadline: pick(d?.invitationHeadline as string, HOME_COPY.invitationHeadline),
    invitationText: pick(d?.invitationText as string, HOME_COPY.invitationText),
    heroImageUrl: d?.heroImage ? imageUrl(d.heroImage, 2400) : "",
    heroVideoId: youtubeId(d?.heroVideoUrl as string),
    featuredSlug: (d?.featuredSlug as string) ?? "",
    supportingSlugs: supporting,
  };
}

export async function getAboutCopy(): Promise<AboutCopy> {
  const d = await fetchDocument<AboutCopy>("aboutPage");
  const paragraphs = ((d?.manifestoParagraphs as string[] | undefined) ?? []).filter((p) => typeof p === "string" && p.trim() !== "");
  const dp = (d?.pillars as { title?: string; body?: string; cta?: string }[] | undefined) ?? [];
  const pillars = ABOUT_COPY.pillars.map((fallback, i) => ({
    title: pick(dp[i]?.title, fallback.title),
    body: pick(dp[i]?.body, fallback.body),
    cta: pick(dp[i]?.cta, fallback.cta),
  }));
  return {
    eyebrow: pick(d?.eyebrow as string, ABOUT_COPY.eyebrow),
    headline: pick(d?.headline as string, ABOUT_COPY.headline),
    manifestoLead: pick(d?.manifestoLead as string, ABOUT_COPY.manifestoLead),
    manifestoParagraphs: paragraphs.length ? paragraphs : ABOUT_COPY.manifestoParagraphs,
    buildingLabel: pick(d?.buildingLabel as string, ABOUT_COPY.buildingLabel),
    buildingHeadline: pick(d?.buildingHeadline as string, ABOUT_COPY.buildingHeadline),
    buildingText: pick(d?.buildingText as string, ABOUT_COPY.buildingText),
    whyLabel: pick(d?.whyLabel as string, ABOUT_COPY.whyLabel),
    whyHeadline: pick(d?.whyHeadline as string, ABOUT_COPY.whyHeadline),
    whyText: pick(d?.whyText as string, ABOUT_COPY.whyText),
    pillars,
    involvedHeadline: pick(d?.involvedHeadline as string, ABOUT_COPY.involvedHeadline),
    involvedText: pick(d?.involvedText as string, ABOUT_COPY.involvedText),
  };
}
