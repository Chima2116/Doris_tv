import { defineField, defineType } from "sanity";

/** Single document. Empty fields fall back to the site's built-in copy. */
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Small label", type: "string" }),
    defineField({ name: "headline", title: "Headline", type: "string" }),
    defineField({ name: "manifestoLead", title: "Manifesto: opening statement", type: "text", rows: 3 }),
    defineField({ name: "manifestoParagraphs", title: "Manifesto: paragraphs", type: "array", of: [{ type: "text", rows: 4 }] }),
    defineField({ name: "buildingLabel", title: "Building: label", type: "string" }),
    defineField({ name: "buildingHeadline", title: "Building: headline", type: "string" }),
    defineField({ name: "buildingText", title: "Building: text", type: "text", rows: 3 }),
    defineField({ name: "whyLabel", title: "Why: label", type: "string" }),
    defineField({ name: "whyHeadline", title: "Why: headline", type: "string" }),
    defineField({ name: "whyText", title: "Why: text", type: "text", rows: 3 }),
    defineField({
      name: "pillars",
      title: "Three pillars (in order: Journal, Filmmakers, Community)",
      type: "array",
      validation: (r) => r.max(3),
      of: [
        {
          type: "object",
          name: "pillar",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "body", title: "Text", type: "text", rows: 3 }),
            defineField({ name: "cta", title: "Link text", type: "string" }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
    }),
    defineField({ name: "involvedHeadline", title: "Get involved: headline", type: "string" }),
    defineField({ name: "involvedText", title: "Get involved: text", type: "text", rows: 2 }),
  ],
  preview: { prepare: () => ({ title: "About page" }) },
});
