import { cacheLife } from "next/cache";
import { sanityClient, sanityConfigured } from "../../../sanity/client";
import { ABOUT_COPY, HOME_COPY, type AboutCopy, type HomeCopy } from "@/data/copy/site-copy";

/** Keeps a Studio value only when it is filled in; otherwise the built-in copy stays. */
const pick = <T extends string>(studio: T | null | undefined, fallback: T): T =>
  typeof studio === "string" && studio.trim() !== "" ? (studio as T) : fallback;

async function fetchDocument<T>(type: string): Promise<Partial<T> | null> {
  "use cache";
  cacheLife("minutes");
  if (!sanityConfigured) return null;
  try {
    return await sanityClient.fetch<Partial<T> | null>(`*[_type == $type][0]`, { type });
  } catch (err) {
    console.error(`Sanity: could not load ${type}, using built-in copy`, err);
    return null;
  }
}

export async function getHomeCopy(): Promise<HomeCopy> {
  const d = await fetchDocument<HomeCopy>("homePage");
  return {
    heroEyebrow: pick(d?.heroEyebrow, HOME_COPY.heroEyebrow),
    heroHeadline: pick(d?.heroHeadline, HOME_COPY.heroHeadline),
    heroIntro: pick(d?.heroIntro, HOME_COPY.heroIntro),
    invitationHeadline: pick(d?.invitationHeadline, HOME_COPY.invitationHeadline),
    invitationText: pick(d?.invitationText, HOME_COPY.invitationText),
  };
}

export async function getAboutCopy(): Promise<AboutCopy> {
  const d = await fetchDocument<AboutCopy>("aboutPage");
  const paragraphs = (d?.manifestoParagraphs ?? []).filter((p) => typeof p === "string" && p.trim() !== "");
  const pillars = ABOUT_COPY.pillars.map((fallback, i) => {
    const p = d?.pillars?.[i];
    return { title: pick(p?.title, fallback.title), body: pick(p?.body, fallback.body), cta: pick(p?.cta, fallback.cta) };
  });
  return {
    eyebrow: pick(d?.eyebrow, ABOUT_COPY.eyebrow),
    headline: pick(d?.headline, ABOUT_COPY.headline),
    manifestoLead: pick(d?.manifestoLead, ABOUT_COPY.manifestoLead),
    manifestoParagraphs: paragraphs.length ? paragraphs : ABOUT_COPY.manifestoParagraphs,
    buildingLabel: pick(d?.buildingLabel, ABOUT_COPY.buildingLabel),
    buildingHeadline: pick(d?.buildingHeadline, ABOUT_COPY.buildingHeadline),
    buildingText: pick(d?.buildingText, ABOUT_COPY.buildingText),
    whyLabel: pick(d?.whyLabel, ABOUT_COPY.whyLabel),
    whyHeadline: pick(d?.whyHeadline, ABOUT_COPY.whyHeadline),
    whyText: pick(d?.whyText, ABOUT_COPY.whyText),
    pillars,
    involvedHeadline: pick(d?.involvedHeadline, ABOUT_COPY.involvedHeadline),
    involvedText: pick(d?.involvedText, ABOUT_COPY.involvedText),
  };
}
