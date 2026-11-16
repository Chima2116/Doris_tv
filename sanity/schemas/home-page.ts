import { defineField, defineType } from "sanity";

/** Single document. Empty fields fall back to the site's built-in content. */
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "journal", title: "Journal sections" },
    { name: "community", title: "Community" },
    { name: "invitation", title: "Invitation" },
  ],
  fields: [
    defineField({ name: "heroEyebrow", title: "Small label above the headline", type: "string", group: "hero" }),
    defineField({ name: "heroHeadline", title: "Headline", type: "string", validation: (r) => r.max(80), group: "hero" }),
    defineField({ name: "heroIntro", title: "Introduction", type: "text", rows: 3, validation: (r) => r.max(320), group: "hero" }),
    defineField({ name: "heroPrimaryLabel", title: "First button label", type: "string", description: "Links to the Journal.", group: "hero" }),
    defineField({ name: "heroSecondaryLabel", title: "Second button label", type: "string", description: "Links to the filmmakers directory.", group: "hero" }),
    defineField({
      name: "heroImage",
      title: "Background image",
      type: "image",
      options: { hotspot: true },
      description: "Shown behind the hero when no video is set.",
      group: "hero",
    }),
    defineField({
      name: "heroVideoUrl",
      title: "Background video (YouTube link)",
      type: "url",
      description: "Paste a YouTube link, for example https://www.youtube.com/watch?v=… . It plays muted behind the text. Leave empty to show the image.",
      validation: (r) =>
        r.uri({ scheme: ["https"] }).custom((v) => (!v || /youtu\.?be/.test(v) ? true : "Use a YouTube link")),
      group: "hero",
    }),
    defineField({ name: "railHeading", title: "Latest stories heading", type: "string", group: "journal" }),
    defineField({ name: "featuredLabel", title: "Featured section label", type: "string", group: "journal" }),
    defineField({
      name: "featuredStory",
      title: "Featured story",
      type: "reference",
      to: [{ type: "journalStory" }],
      description: "The large story on the home page. If empty, the story flagged as featured is used.",
      group: "journal",
    }),
    defineField({
      name: "supportingStories",
      title: "Supporting stories (up to three)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "journalStory" }] }],
      validation: (r) => r.max(3),
      description: "Shown beside the featured story. If empty, the newest other stories are used.",
      group: "journal",
    }),
    defineField({ name: "collectionsHeading", title: "Collections heading", type: "string", group: "journal" }),
    defineField({ name: "collectionsIntro", title: "Collections introduction", type: "text", rows: 2, group: "journal" }),
    defineField({ name: "communityHeading", title: "Community heading", type: "string", group: "community" }),
    defineField({ name: "communityIntro", title: "Community introduction", type: "text", rows: 2, group: "community" }),
    defineField({ name: "invitationHeadline", title: "Headline", type: "string", group: "invitation" }),
    defineField({ name: "invitationText", title: "Supporting line", type: "string", group: "invitation" }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
