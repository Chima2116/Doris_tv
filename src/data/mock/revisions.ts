import type { ProfileRevision } from "@/data/types";

/** Seed profile revisions: one waiting in the admin queue, one previously rejected. */
export const REVISIONS: ProfileRevision[] = [
  {
    id: "rev_s1",
    filmmakerId: "f_esi_mensah_boateng",
    status: "pending",
    submittedAt: "2026-11-10T15:00:00Z",
    proposed: {
      name: "Esi Mensah-Boateng",
      country: "Ghana",
      location: "Accra",
      primaryDiscipline: "Writer",
      yearsActive: "2011 – present",
      biography:
        "Esi Mensah-Boateng is a screenwriter and director whose films are built from domestic spaces: kitchens, courtyards, the corridor outside a sickroom. Her scripts are known for dialogue that carries three languages at once.\n\nShe teaches screenwriting workshops for emerging writers across West Africa, and is currently developing her third feature, Harmattan Rooms, with a Ghana-Senegal co-production team.",
      creativePhilosophy: "A house has its own soundtrack. If you listen closely enough, the whole family history is in it.",
      credits: [
        { id: "rc1", title: "Harmattan Rooms", year: 2026, role: "Writer, Director", format: "Feature", inProduction: true },
        { id: "rc2", title: "The Courtyard Season", year: 2025, role: "Writer, Director", format: "Feature", runtimeMinutes: 97 },
        { id: "rc3", title: "Ama's Radio", year: 2022, role: "Writer", format: "Feature", runtimeMinutes: 91 },
        { id: "rc4", title: "Kente Hours", year: 2019, role: "Writer, Director", format: "Short", runtimeMinutes: 21 },
        { id: "rc5", title: "Fufu on Sundays", year: 2015, role: "Writer", format: "Short", runtimeMinutes: 12 },
      ],
      links: [
        { label: "Website", url: "https://example.com/" },
        { label: "Instagram", url: "https://www.instagram.com/" },
        { label: "Vimeo", url: "https://vimeo.com/" },
      ],
    },
  },
  {
    id: "rev_s2",
    filmmakerId: "f_temi_adeyemi",
    status: "rejected",
    submittedAt: "2026-10-28T11:00:00Z",
    decidedAt: "2026-10-29T09:30:00Z",
    decisionReason: "The proposed biography included unverified festival claims. Please add links to programme listings and resubmit.",
    proposed: {
      name: "Temi Adeyemi",
      country: "Nigeria",
      location: "Lagos",
      primaryDiscipline: "Director",
      yearsActive: "2014 – present",
      biography:
        "Temi Adeyemi directs fiction that stays close to the street. Eko Rising, shot across five Lagos communities without a fixed budget, made her one of the most celebrated directors of her generation, winning awards at five international festivals.",
      creativePhilosophy: "I didn't set out to make a political film. The story made itself political.",
      credits: [
        { id: "rt1", title: "Eko Rising", year: 2024, role: "Director, Writer", format: "Feature", runtimeMinutes: 108 },
      ],
      links: [{ label: "Instagram", url: "https://www.instagram.com/" }],
    },
  },
];
