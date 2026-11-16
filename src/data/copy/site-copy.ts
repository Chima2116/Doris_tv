/**
 * Editable page copy. These defaults are what the site shows until the text is edited in the
 * Studio ("Home page" and "About page"). Any field left empty in the Studio falls back here.
 */
export const HOME_COPY = {
  heroEyebrow: "Independent African cinema",
  heroPrimaryLabel: "Explore the Journal",
  heroSecondaryLabel: "Discover filmmakers",
  railHeading: "Latest from the Journal",
  featuredLabel: "Featured",
  collectionsHeading: "Browse the Journal by collection.",
  collectionsIntro: "Five ways in: conversations with filmmakers, essays on form, notes from set, retrospectives and video conversations.",
  communityHeading: "The conversation around African cinema.",
  communityIntro: "Filmmakers, writers and film lovers on craft, funding, festivals and what to watch. Anyone can read. Members take part.",
  heroHeadline: "Where independent African film lives",
  heroIntro: "Stories, filmmakers and conversations shaping African cinema.",
  invitationHeadline: "Join the DORIS TV community.",
  invitationText: "Free to join. Be there from the start.",
  spotlightLabel: "Filmmaker spotlight",
  communityTopics: [] as string[],
  invitationBenefits: [
    { title: "Follow filmmakers", body: "Keep up with the people whose work you want to see more of." },
    { title: "Save stories", body: "Build a reading list from the Journal and return to it." },
    { title: "Join the conversation", body: "Reply, react and start discussions with other members." },
  ] as { title: string; body: string }[],
};

export const ABOUT_COPY = {
  eyebrow: "About DORIS TV",
  headline: "African cinema deserves attention, context and company.",
  manifestoLead:
    "Independent African film is being made with extraordinary ambition, often with very little. Too much of it is hard to find, hard to read about, and hard to talk about.",
  manifestoParagraphs: [
    "DORIS TV exists to change that. We are building an editorial and community home for independent African cinema: a place where filmmakers are represented professionally, where their work is written about with care, and where people who love film can meet each other.",
    "We believe the conversation around a film is part of the film's life. Good criticism, honest production writing and generous discussion are how a cinema builds a memory, and how the next generation of filmmakers finds the ones who came before.",
  ],
  buildingLabel: "What we're building",
  buildingHeadline: "A curated cultural destination.",
  buildingText:
    "Not a generic social network, and not a catalogue. A carefully edited site where stories, people and conversation sit side by side, and where quality comes before volume.",
  whyLabel: "Why it matters",
  whyHeadline: "Visibility changes what gets made.",
  whyText:
    "When filmmakers are discoverable and their work is taken seriously, they find collaborators, audiences and the confidence to keep going. Independent film depends on that ecosystem as much as on cameras and budgets.",
  pillars: [
    { title: "The Journal", body: "Interviews, essays, production notes, retrospectives and video conversations, written and commissioned with the seriousness African cinema deserves.", cta: "Read the Journal" },
    { title: "The Filmmakers", body: "A directory of independent filmmakers with professional profiles: who they are, how they think, and the work they have made.", cta: "Meet the filmmakers" },
    { title: "The Community", body: "A place to talk about the work: craft, festivals, distribution and recommendations, among people who care to look closely.", cta: "Join the conversation" },
  ],
  involvedHeadline: "Be part of it from the start.",
  involvedText: "Create a free account to join the Community. Filmmakers can apply for a profile, reviewed by our team.",
};

export type HomeCopy = typeof HOME_COPY & {
  heroImageUrl: string;
  heroVideoId: string;
  heroVideoFileUrl: string;
  featuredSlug: string;
  supportingSlugs: string[];
  spotlightFilmmakerSlug: string;
  latestSlugs: string[];
  collectionNames: string[];
};
export type AboutCopy = typeof ABOUT_COPY;
