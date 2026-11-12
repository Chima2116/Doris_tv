import type { ApplicationDetails, FilmCredit, FilmmakerApplication } from "@/data/types";

const credit = (id: string, title: string, year: number, role: string, format: string, runtimeMinutes?: number): FilmCredit => ({
  id,
  title,
  year,
  role,
  format,
  runtimeMinutes,
});

const details = (d: Partial<ApplicationDetails> & Pick<ApplicationDetails, "fullName" | "email" | "country" | "primaryDiscipline" | "biography">): ApplicationDetails => ({
  links: [],
  credits: [],
  ...d,
});

/** Seed applications covering every review state, with timelines. */
export const APPLICATIONS: FilmmakerApplication[] = [
  {
    id: "app_kofi",
    applicantId: "m_kofi",
    createdAt: "2026-11-03T09:00:00Z",
    submittedAt: "2026-11-04T10:30:00Z",
    status: "under_review",
    details: details({
      fullName: "Kofi Asante",
      email: "kofi.asante@example.com",
      country: "Ghana",
      city: "Kumasi",
      primaryDiscipline: "Writer",
      yearsActive: "2022 – present",
      biography:
        "I write short fiction for screen and have two shorts in post-production. My work follows young people moving between Kumasi and Accra and the small negotiations of family life. I am also studying cinema and run a student writing circle.",
      creativeBackground: "Student writer with two completed short scripts and a produced stage reading.",
      creativePhilosophy: "Write what you overhear.",
      portfolioUrl: "https://example.com/kofi",
      links: [{ label: "Instagram", url: "https://www.instagram.com/" }],
      credits: [credit("ac_1", "Trotro", 2025, "Writer", "Short", 12), credit("ac_2", "Waiting Room", 2024, "Writer", "Short", 9)],
    }),
    history: [
      { status: "draft", at: "2026-11-03T09:00:00Z" },
      { status: "submitted", at: "2026-11-04T10:30:00Z" },
      { status: "under_review", at: "2026-11-06T14:00:00Z", note: "A reviewer is looking at your credits and portfolio." },
    ],
  },
  {
    id: "app_zainab_1",
    applicantId: "m_zainab",
    createdAt: "2026-10-12T11:00:00Z",
    submittedAt: "2026-10-12T12:00:00Z",
    status: "rejected",
    decidedAt: "2026-10-20T16:00:00Z",
    decisionReason:
      "We couldn't verify any completed professional credits yet. Please reapply once you have at least one finished project with a public record, such as a festival listing or a screening page.",
    details: details({
      fullName: "Zainab Abubakar",
      email: "zainab.abubakar@example.com",
      country: "Nigeria",
      city: "Kano",
      primaryDiscipline: "Producer",
      yearsActive: "2025 – present",
      biography:
        "I programme screenings of Hausa-language independent films in Kano and am developing my first short as a producer. I am keen to support filmmakers from northern Nigeria.",
      credits: [credit("ac_3", "Untitled Kano short", 2026, "Producer", "Short")],
    }),
    history: [
      { status: "draft", at: "2026-10-12T11:00:00Z" },
      { status: "submitted", at: "2026-10-12T12:00:00Z" },
      { status: "under_review", at: "2026-10-15T09:00:00Z" },
      {
        status: "rejected",
        at: "2026-10-20T16:00:00Z",
        note: "Not approved: no verifiable completed credits yet. You're welcome to apply again.",
      },
    ],
  },
  {
    id: "app_fatou",
    applicantId: "m_fatou",
    createdAt: "2026-11-08T08:00:00Z",
    submittedAt: "2026-11-08T09:15:00Z",
    status: "submitted",
    details: details({
      fullName: "Fatou Sy",
      email: "fatou.sy@example.com",
      country: "Senegal",
      city: "Dakar",
      primaryDiscipline: "Multi-hyphenate",
      yearsActive: "2019 – present",
      biography:
        "Programmer, producer and editor. I run a monthly film club in Dakar and have produced and edited three shorts with first-time directors. I want a profile that connects my programming and production work.",
      creativeBackground: "Film club organiser; producer and editor on three shorts.",
      portfolioUrl: "https://example.com/fatou",
      links: [{ label: "Vimeo", url: "https://vimeo.com/" }],
      credits: [
        credit("ac_4", "Ndar Sunrise", 2025, "Producer, Editor", "Short", 15),
        credit("ac_5", "Baay", 2023, "Editor", "Short", 11),
        credit("ac_6", "Sunday Reel", 2022, "Producer", "Short documentary", 13),
      ],
    }),
    history: [
      { status: "draft", at: "2026-11-08T08:00:00Z" },
      { status: "submitted", at: "2026-11-08T09:15:00Z" },
    ],
  },
  {
    id: "app_obinna",
    applicantId: "m_obinna",
    createdAt: "2026-11-09T13:00:00Z",
    submittedAt: "2026-11-09T14:20:00Z",
    status: "submitted",
    details: details({
      fullName: "Obinna Ogu",
      email: "obinna.ogu@example.com",
      country: "Nigeria",
      city: "Enugu",
      primaryDiscipline: "Writer",
      yearsActive: "2017 – present",
      biography:
        "Film writer and occasional screenwriter focused on industry structure and access. I have co-written two shorts and contribute essays to the DORIS Journal.",
      links: [{ label: "Website", url: "https://example.com/obinna" }],
      credits: [credit("ac_7", "The Syllabus", 2024, "Co-writer", "Short", 14), credit("ac_8", "Back Row", 2022, "Co-writer", "Short", 10)],
    }),
    history: [
      { status: "draft", at: "2026-11-09T13:00:00Z" },
      { status: "submitted", at: "2026-11-09T14:20:00Z" },
    ],
  },
  {
    id: "app_tolu",
    applicantId: "m_tolu",
    createdAt: "2026-11-10T10:00:00Z",
    submittedAt: "2026-11-10T11:00:00Z",
    status: "under_review",
    details: details({
      fullName: "Tolu Akinlade",
      email: "tolu.akinlade@example.com",
      country: "Nigeria",
      city: "Ibadan",
      primaryDiscipline: "Multi-hyphenate",
      yearsActive: "2015 – present",
      biography:
        "Interviewer, film writer and documentary editor. I have edited two documentary shorts and conduct filmmaker interviews for video conversations.",
      links: [{ label: "Instagram", url: "https://www.instagram.com/" }],
      credits: [credit("ac_9", "Market Day", 2023, "Editor", "Short documentary", 16), credit("ac_10", "Ibadan Roofs", 2021, "Editor", "Short documentary", 12)],
    }),
    history: [
      { status: "draft", at: "2026-11-10T10:00:00Z" },
      { status: "submitted", at: "2026-11-10T11:00:00Z" },
      { status: "under_review", at: "2026-11-11T09:00:00Z" },
    ],
  },
];
