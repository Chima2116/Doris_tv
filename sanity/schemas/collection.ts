import { defineField, defineType } from "sanity";

/**
 * A Journal collection. Stories are filed under a collection, and each collection appears as a
 * filter on the Journal and as a tile on the home page.
 */
export const collection = defineType({
  name: "collection",
  title: "Journal collection",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title shown to readers",
      type: "string",
      description: "For example, Interviews or Production Notes.",
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: "name",
      title: "Key",
      type: "string",
      description:
        "Stories in this collection are filed under this key. Use the existing keys for the built-in collections: Interview, Essay, Production Notes, Retrospective, Video.",
      validation: (r) => r.required().max(60),
    }),
    defineField({ name: "description", title: "Short description", type: "text", rows: 2, validation: (r) => r.max(160) }),
    defineField({ name: "image", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "imageAlt", title: "Cover image description", type: "string", description: "Describe what the photo shows, for screen readers." }),
    defineField({ name: "credit", title: "Photo credit", type: "string" }),
    defineField({ name: "order", title: "Display order", type: "number", description: "Lower numbers appear first." }),
  ],
  orderings: [{ title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "name", media: "image" } },
});
