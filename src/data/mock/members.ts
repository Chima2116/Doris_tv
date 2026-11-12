import type { Member } from "@/data/types";
import { DEMO_IDENTITIES } from "./demo-users";

const base = {
  accountStatus: "active",
  emailVerified: true,
  waitlistLinked: true,
  profileVisibility: "public",
  privacy: { visibility: "public", hiddenSections: [] },
  roles: ["member"],
} satisfies Partial<Member>;

const extra: Member[] = [
  { ...base, id: "m_obinna", username: "obinna_ogu", displayName: "Obinna Ogu", bio: "Writer on film industries and access.", location: "Enugu, Nigeria", memberSince: "2026-09-10" },
  { ...base, id: "m_tolu", username: "tolu_akinlade", displayName: "Tolu Akinlade", bio: "Interviewer and film writer.", location: "Ibadan, Nigeria", memberSince: "2026-09-05" },
  { ...base, id: "m_fatou", username: "fatou_sy", displayName: "Fatou Sy", bio: "Film club organiser in Dakar.", location: "Dakar, Senegal", memberSince: "2026-10-07" },
  {
    ...base,
    id: "m_john",
    username: "john_odhiambo",
    displayName: "John Odhiambo",
    bio: "Documentary editor from Kisumu.",
    location: "Kisumu, Kenya",
    memberSince: "2026-10-11",
    profileVisibility: "private",
    privacy: { visibility: "private", hiddenSections: ["bio", "activity", "following"] },
  },
];

export const MEMBERS: Member[] = [
  ...DEMO_IDENTITIES.flatMap((i) => (i.member ? [i.member] : [])),
  ...extra,
];
