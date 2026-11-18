import type { Filmmaker } from "@/data/types";

/**
 * Dummy listing for the demo filmmaker account (Ngozi Ihejirika, m_demo_filmmaker), already set up
 * so the profile and listing editor have content to show. Replace or delete it once real profiles
 * are published in the Studio.
 */
export const FILMMAKERS: Filmmaker[] = [
  {
    id: "f_ngozi_ihejirika",
    memberId: "m_demo_filmmaker",
    slug: "ngozi-ihejirika",
    name: "Ngozi Ihejirika",
    portraitUrl: "",
    portraitAlt: "Ngozi Ihejirika",
    country: "Nigeria",
    location: "Lagos",
    primaryDiscipline: "Director",
    tagline: "Documentary director. Lagos.",
    biography: "Ngozi makes documentaries about work, water and the people who keep Lagos running. Dummy text: replace with the filmmaker's own biography.",
    creativePhilosophy: "Stay close to the people in the frame.",
    yearsActive: "2019 to present",
    activeFrom: 2019,
    credits: [
      { id: "c_ngozi_1", title: "Ferry Hands", year: 2023, format: "Documentary", runtimeMinutes: 48, role: "Director" },
      { id: "c_ngozi_2", title: "Night Shift at the Port", year: 2025, format: "Short documentary", runtimeMinutes: 22, role: "Director, editor" },
      { id: "c_ngozi_3", title: "Salt and Sand", year: 2026, format: "Documentary", role: "Director", inProduction: true },
    ],
    links: [],
    verificationStatus: "verified",
    publicationStatus: "published",
  },
];
