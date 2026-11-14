import type { Member } from "@/data/types";

/**
 * Demo identities for the development account switcher.
 * These are the seed for the full members dataset added in Phase 2.
 */
const base: Pick<
  Member,
  "accountStatus" | "emailVerified" | "profileVisibility" | "privacy"
> = {
  accountStatus: "active",
  emailVerified: true,
  profileVisibility: "public",
  privacy: { visibility: "public", hiddenSections: [] },
};

export type DemoIdentityKey =
  | "guest"
  | "newMember"
  | "member"
  | "filmmaker"
  | "moderator"
  | "admin"
  | "unverified"
  | "applicant"
  | "rejected"
  | "suspended";

export const DEMO_IDENTITIES: {
  key: DemoIdentityKey;
  label: string;
  description: string;
  member: Member | null;
}[] = [
  {
    key: "guest",
    label: "Guest",
    description: "Browse public content and create a free account.",
    member: null,
  },
  {
    key: "unverified",
    label: "Unverified member",
    description: "Signed in, but email not verified. Gated from participating.",
    member: {
      ...base,
      id: "m_demo_unverified",
      username: "kwame_t",
      displayName: "Kwame Tetteh",
      location: "Accra, Ghana",
      memberSince: "2026-11-02",
      roles: ["member"],
      emailVerified: false,
    },
  },
  {
    key: "newMember",
    label: "New member",
    description: "Verified email, no profile yet. Can take part in the Community and apply as a filmmaker.",
    member: {
      ...base,
      id: "m_demo_new_member",
      username: "amina_diallo",
      displayName: "Amina Diallo",
      bio: "Film student in Dakar. Mostly watching, slowly writing.",
      location: "Dakar, Senegal",
      memberSince: "2026-10-14",
      roles: ["member"],
    },
  },
  {
    key: "member",
    label: "Approved member",
    description: "Standard member with full Community access.",
    member: {
      ...base,
      id: "m_demo_member",
      username: "adaeze_nwosu",
      displayName: "Adaeze Nwosu",
      bio: "Festival-goer, programmer and occasional critic based in Lagos.",
      location: "Lagos, Nigeria",
      memberSince: "2026-10-01",
      roles: ["member"],
    },
  },
  {
    key: "filmmaker",
    label: "Verified filmmaker",
    description: "Approved filmmaker who can manage their profile (changes need approval).",
    member: {
      ...base,
      id: "m_demo_filmmaker",
      username: "ngozi_ihejirika",
      displayName: "Ngozi Ihejirika",
      bio: "Documentary director. Lagos.",
      location: "Lagos, Nigeria",
      memberSince: "2026-09-20",
      roles: ["member", "filmmaker"],
      filmmakerId: "f_ngozi_ihejirika",
    },
  },
  {
    key: "moderator",
    label: "Moderator",
    description: "Reviews reports, hides content pending review, escalates.",
    member: {
      ...base,
      id: "m_demo_moderator",
      username: "kola_fashola",
      displayName: "Kola Fashola",
      location: "Abuja, Nigeria",
      memberSince: "2026-09-12",
      roles: ["member", "moderator"],
    },
  },
  {
    key: "admin",
    label: "Admin",
    description: "Full administrative capabilities.",
    member: {
      ...base,
      id: "m_demo_admin",
      username: "doris_admin",
      displayName: "Doris Editorial",
      location: "Lagos, Nigeria",
      memberSince: "2026-08-01",
      roles: ["member", "admin"],
    },
  },
  {
    key: "applicant",
    label: "Filmmaker applicant",
    description: "Has a filmmaker application under review.",
    member: {
      ...base,
      id: "m_kofi",
      username: "kofi_asante",
      displayName: "Kofi Asante",
      bio: "Cinema studies student in Kumasi.",
      location: "Kumasi, Ghana",
      memberSince: "2026-10-03",
      roles: ["member"],
    },
  },
  {
    key: "rejected",
    label: "Rejected applicant",
    description: "A previous application was rejected; can apply again.",
    member: {
      ...base,
      id: "m_zainab",
      username: "zainab_abubakar",
      displayName: "Zainab Abubakar",
      bio: "Kano-based programmer looking for Hausa-language independents.",
      location: "Kano, Nigeria",
      memberSince: "2026-09-18",
      roles: ["member"],
    },
  },
  {
    key: "suspended",
    label: "Suspended moderator",
    description: "Account status beats role: moderation powers are inactive.",
    member: {
      ...base,
      id: "m_demo_suspended",
      username: "tunde_a",
      displayName: "Tunde Adebayo",
      location: "Ibadan, Nigeria",
      memberSince: "2026-09-30",
      roles: ["member", "moderator"],
      accountStatus: "suspended",
    },
  },
];

export const getDemoIdentity = (key: string) =>
  DEMO_IDENTITIES.find((i) => i.key === key) ?? DEMO_IDENTITIES[0];
