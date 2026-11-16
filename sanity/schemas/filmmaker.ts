import { defineField, defineType } from "sanity";

export const filmmaker = defineType({
  name: "filmmaker",
  title: "Filmmaker",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name", maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: "portrait", title: "Portrait", type: "image", options: { hotspot: true } }),
    defineField({ name: "portraitAlt", title: "Portrait description", type: "string", description: "Describe the portrait for screen readers." }),
    defineField({ name: "country", title: "Country", type: "string", validation: (r) => r.required() }),
    defineField({ name: "location", title: "City or region", type: "string" }),
    defineField({ name: "primaryDiscipline", title: "Primary discipline", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", title: "Tagline", type: "string", validation: (r) => r.max(140) }),
    defineField({ name: "biography", title: "Biography", type: "text", rows: 6, validation: (r) => r.required() }),
    defineField({ name: "creativePhilosophy", title: "Creative philosophy", type: "text", rows: 3 }),
    defineField({ name: "activeFrom", title: "Active since (year)", type: "number" }),
    defineField({ name: "yearsActive", title: "Years active (as shown)", type: "string", description: "For example, 2012 to present." }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      of: [
        {
          type: "object",
          name: "credit",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "year", title: "Year", type: "number", validation: (r) => r.required() }),
            defineField({ name: "role", title: "Role", type: "string", validation: (r) => r.required() }),
            defineField({ name: "format", title: "Format", type: "string" }),
            defineField({ name: "runtimeMinutes", title: "Runtime (minutes)", type: "number" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
            defineField({ name: "inProduction", title: "Currently in production", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "title", year: "year" }, prepare: ({ title, year }) => ({ title, subtitle: year ? String(year) : "" }) },
        },
      ],
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [
        {
          type: "object",
          name: "link",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "url", title: "URL", type: "url", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        },
      ],
    }),
    defineField({
      name: "verificationStatus",
      title: "Verification",
      type: "string",
      options: {
        list: [
          { title: "Unverified", value: "unverified" },
          { title: "Verified", value: "verified" },
        ],
        layout: "radio",
      },
      initialValue: "unverified",
    }),
    defineField({ name: "spotlight", title: "Feature in the homepage spotlight", type: "boolean", initialValue: false }),
    defineField({
      name: "publicationStatus",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Unpublished", value: "unpublished" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "primaryDiscipline", media: "portrait" },
  },
});
