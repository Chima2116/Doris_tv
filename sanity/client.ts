import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { apiVersion, dataset, projectId } from "./env";

export const sanityConfigured = projectId.length > 0;

export const sanityClient = createClient({
  projectId: projectId || "unconfigured",
  dataset,
  apiVersion,
  useCdn: false,
});

const builder = imageUrlBuilder(sanityClient);

export function imageUrl(source: unknown, width = 1600): string {
  return builder.image(source as never).width(width).fit("max").auto("format").url();
}
