import { defineField, defineType } from "sanity";

export const journalStory = defineType({
  name: "journalStory",
  title: "Journal story",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required().max(120) }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Interview", value: "Interview" },
          { title: "Essay", value: "Essay" },
          { title: "Production Notes", value: "Production Notes" },
          { title: "Retrospective", value: "Retrospective" },
        ],
      },
      initialValue: "Essay",
      validation: (r) => r.required(),
    }),
    defineField({ name: "author", title: "Author", type: "string", validation: (r) => r.required() }),
    defineField({ name: "excerpt", title: "Excerpt (shown as the standfirst)", type: "text", rows: 3, validation: (r) => r.max(280) }),
    defineField({ name: "coverImage", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "coverAlt", title: "Cover image description", type: "string", description: "Describe what the photo shows, for screen readers." }),
    defineField({ name: "coverCredit", title: "Photo credit", type: "string" }),
    defineField({ name: "featured", title: "Feature on the Journal front page", type: "boolean", initialValue: false }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Scheduled", value: "scheduled" },
          { title: "Published", value: "published" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Quote", value: "blockquote" },
          ],
        },
        { type: "image", options: { hotspot: true } },
      ],
    }),
  ],
  preview: {
    select: { title: "title", status: "status", media: "coverImage" },
    prepare({ title, status, media }) {
      return { title, subtitle: status ?? "draft", media };
    },
  },
});
