import { defineField, defineType } from "sanity";

/** Single document. Empty fields fall back to the site's built-in copy. */
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({ name: "heroEyebrow", title: "Hero: small label above the headline", type: "string" }),
    defineField({ name: "heroHeadline", title: "Hero: headline", type: "string", validation: (r) => r.max(80) }),
    defineField({ name: "heroIntro", title: "Hero: introduction", type: "text", rows: 3, validation: (r) => r.max(320) }),
    defineField({ name: "invitationHeadline", title: "Invitation: headline", type: "string" }),
    defineField({ name: "invitationText", title: "Invitation: supporting line", type: "string" }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
