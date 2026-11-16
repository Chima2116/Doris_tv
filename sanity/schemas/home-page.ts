import { defineField, defineType } from "sanity";

/** Single document. Each group below is one section of the home page, in page order. */
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: [
    { name: "hero", title: "1. Hero (top of the page)", default: true },
    { name: "latest", title: "2. Latest stories" },
    { name: "featured", title: "3. Featured story and highlights" },
    { name: "collections", title: "4. Collections" },
    { name: "spotlight", title: "5. Filmmaker spotlight" },
    { name: "community", title: "6. Community and topics" },
    { name: "invitation", title: "7. Invitation (bottom of the page)" },
  ],
  fields: [
    defineField({ name: "heroEyebrow", title: "Small label above the headline", type: "string", group: "hero" }),
    defineField({ name: "heroHeadline", title: "Headline", type: "string", validation: (r) => r.max(80), group: "hero" }),
    defineField({ name: "heroIntro", title: "Introduction", type: "text", rows: 3, validation: (r) => r.max(320), group: "hero" }),
    defineField({ name: "heroPrimaryLabel", title: "First button label", type: "string", description: "Links to the Journal.", group: "hero" }),
    defineField({ name: "heroSecondaryLabel", title: "Second button label", type: "string", description: "Links to the filmmakers directory.", group: "hero" }),
    defineField({ name: "heroVideoUrl", title: "Background video (YouTube link)", type: "url", description: "Plays muted behind the text. Leave empty to show the image.", validation: (r) => r.uri({ scheme: ["https"] }).custom((v) => (!v || /youtu\.?be/.test(v) ? true : "Use a YouTube link")), group: "hero" }),
    defineField({ name: "heroImage", title: "Background image", type: "image", options: { hotspot: true }, description: "Shown behind the hero when no video is set.", group: "hero" }),

    defineField({ name: "railHeading", title: "Heading", type: "string", group: "latest" }),

    defineField({ name: "featuredLabel", title: "Small label", type: "string", group: "featured" }),
    defineField({ name: "featuredStory", title: "Featured story", type: "reference", to: [{ type: "journalStory" }], description: "The large story. If empty, the story flagged as featured is used.", group: "featured" }),
    defineField({ name: "supportingStories", title: "Highlights beside it (up to three)", type: "array", of: [{ type: "reference", to: [{ type: "journalStory" }] }], validation: (r) => r.max(3), description: "If empty, the newest other stories are used.", group: "featured" }),

    defineField({ name: "collectionsHeading", title: "Heading", type: "string", group: "collections" }),
    defineField({ name: "collectionsIntro", title: "Introduction", type: "text", rows: 2, description: "The collections themselves are set up under Journal collection.", group: "collections" }),

    defineField({ name: "spotlightFilmmaker", title: "Filmmaker to feature", type: "reference", to: [{ type: "filmmaker" }], description: "If empty, the filmmaker ticked for the homepage spotlight is used.", group: "spotlight" }),

    defineField({ name: "communityHeading", title: "Heading", type: "string", group: "community" }),
    defineField({ name: "communityIntro", title: "Introduction", type: "text", rows: 2, group: "community" }),
    defineField({ name: "communityTopics", title: "Topics (shown as large links)", type: "array", of: [{ type: "string" }], validation: (r) => r.max(10), description: "Each topic links to the Community. Type the topic name exactly as members will see it.", group: "community" }),

    defineField({ name: "invitationHeadline", title: "Headline", type: "string", group: "invitation" }),
    defineField({ name: "invitationText", title: "Supporting line", type: "string", group: "invitation" }),
    defineField({
      name: "invitationBenefits",
      title: "Benefits (three)",
      type: "array",
      validation: (r) => r.max(3),
      of: [
        {
          type: "object",
          name: "benefit",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "body", title: "Text", type: "string" }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        },
      ],
      group: "invitation",
    }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
