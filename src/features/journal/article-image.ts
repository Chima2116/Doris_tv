import { IMAGES, type ImageAsset } from "@/data/images";

/**
 * Photographs attached to Journal stories, by slug (licensed Wikimedia Commons and Pexels images,
 * used as editorial illustration: captions say what the photograph shows, never that it is from the
 * story's film). Only stories whose photograph genuinely relates to them are listed; every other story shows a labelled cover plate until its own image
 * is supplied (docs/ASSET-REQUIREMENTS.md).
 */
const BY_SLUG: Record<string, ImageAsset> = {
  "who-gets-to-see-african-films": IMAGES.fespacoEntrance,
  "what-it-costs-to-finish-a-feature": IMAGES.crewSeated,
  "shooting-in-badagry-permits-trust-history": IMAGES.crewStreet,
  "what-lagos-sounds-like": IMAGES.lagosStreet,
  "light-before-lens-wanjiru-kamau": IMAGES.cameraMonitor,
  "making-films-in-the-language-you-dream-in": IMAGES.lagosMarket,
  "northern-voices-five-films-hausa-cinema": IMAGES.streetEquipment,
  "against-resolution-the-unfinished-frame": IMAGES.editorDark,
  "ngozi-ihejirika-ferry-workers-video": IMAGES.cameramanJohannesburg,
  "temi-adeyemi-press-room-video": IMAGES.tripodOutdoors,
  "moussa-ndiaye-on-co-production-video": IMAGES.eventBujumbura,
};

/** Photographs hosted by Sanity arrive as URLs on the story itself. */
const SANITY_IMAGE_HOST = "https://cdn.sanity.io/";

/**
 * The photograph for a story: a curated licensed image for known stories, otherwise the cover
 * supplied in the Studio. Returns undefined when the story has no photograph yet.
 */
export function articleImage(article: { slug: string; coverImage?: string; coverAlt?: string; title?: string }): ImageAsset | undefined {
  // A cover uploaded in the Studio always wins over a curated photograph for the same slug.
  if (article.coverImage?.startsWith(SANITY_IMAGE_HOST)) {
    return {
      src: article.coverImage,
      alt: article.coverAlt || article.title || "",
      caption: "",
      focal: "50% 50%",
    };
  }
  return BY_SLUG[article.slug];
}
