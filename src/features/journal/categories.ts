import type { ImageAsset } from "@/data/images";

export const JOURNAL_PAGE_SIZE = 6;

/** A Journal collection as the site uses it. `name` is the key stories are filed under. */
export type CollectionInfo = {
  name: string;
  label: string;
  value: string;
  description: string;
  image?: ImageAsset;
};

/** The URL value for a collection's filter, e.g. "Production Notes" becomes "production-notes". */
export const collectionValue = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Filter tabs for the Journal: All, then one per collection. */
export function filterOptions(collections: CollectionInfo[]): { value: string; label: string; category?: string }[] {
  return [{ value: "", label: "All" }, ...collections.map((c) => ({ value: c.value, label: c.label, category: c.name }))];
}
