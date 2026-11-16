import { cacheLife } from "next/cache";
import { groq } from "next-sanity";
import { sanityClient, sanityConfigured, imageUrl } from "../../../sanity/client";
import { IMAGES, type ImageAsset } from "@/data/images";
import { collectionValue, type CollectionInfo } from "@/features/journal/categories";

/** The five collections the Journal started with. Used until collections are added in the Studio. */
const BUILT_IN: { name: string; label: string; description: string; image: ImageAsset }[] = [
  { name: "Interview", label: "Interviews", description: "Directors, writers and cinematographers on how the work gets made.", image: IMAGES.interviewStadium },
  { name: "Essay", label: "Essays", description: "Longer arguments about form, language and what the films are doing.", image: IMAGES.gradingSuite },
  { name: "Production Notes", label: "Production Notes", description: "Locations, budgets and the practical side of finishing a film.", image: IMAGES.cameraSetupAbuja },
  { name: "Retrospective", label: "Retrospectives", description: "Looking back at movements, places and the habits of watching together.", image: IMAGES.openAirCinema },
  { name: "Video", label: "Video", description: "Filmed conversations, hosted on their original platforms.", image: IMAGES.cameraKigali },
];

const DEFAULT_COLLECTIONS: CollectionInfo[] = BUILT_IN.map((b) => ({
  name: b.name,
  label: b.label,
  value: collectionValue(b.label),
  description: b.description,
  image: b.image,
}));

const COLLECTIONS_QUERY = groq`*[_type == "collection"] | order(order asc, title asc) {
  title,
  name,
  description,
  image,
  imageAlt,
  credit
}`;

type SanityCollection = {
  title: string;
  name: string;
  description?: string;
  image?: unknown;
  imageAlt?: string;
  credit?: string;
};

/**
 * Journal collections in display order. Collections added in the Studio are used as they are;
 * if the Studio has none, the five built-in collections are shown.
 */
export async function getCollections(): Promise<CollectionInfo[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 30, expire: 3600 });
  if (!sanityConfigured) return DEFAULT_COLLECTIONS;
  try {
    const rows = await sanityClient.fetch<SanityCollection[]>(COLLECTIONS_QUERY);
    if (!rows.length) return DEFAULT_COLLECTIONS;
    return rows.map((r) => {
      const builtIn = BUILT_IN.find((b) => b.name === r.name);
      const image: ImageAsset | undefined = r.image
        ? { src: imageUrl(r.image, 1600), alt: r.imageAlt || r.title, caption: "", focal: "50% 50%" }
        : builtIn?.image;
      return {
        name: r.name,
        label: r.title,
        value: collectionValue(r.title),
        description: r.description || builtIn?.description || "",
        image,
      };
    });
  } catch (err) {
    console.error("Sanity: could not load Journal collections, using built-in collections", err);
    return DEFAULT_COLLECTIONS;
  }
}
