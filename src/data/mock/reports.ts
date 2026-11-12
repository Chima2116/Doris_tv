import type { ModerationReport } from "@/data/types";

/** Seed moderation reports covering every state. */
export const REPORTS: ModerationReport[] = [
  {
    id: "rep_s1",
    target: { type: "reply", id: "r_13" },
    reporterId: "m_obinna",
    reason: "off_topic",
    details: "Reads like a sales pitch rather than a contribution to the thread.",
    status: "hidden",
    createdAt: "2026-11-10T09:00:00Z",
    notes: [
      { id: "n1", authorId: "m_demo_moderator", body: "Hidden pending admin review. Borderline, but worth a second look.", createdAt: "2026-11-10T10:15:00Z" },
    ],
  },
  {
    id: "rep_s2",
    target: { type: "discussion", id: "d_10" },
    reporterId: "m_zainab",
    reason: "misinformation",
    details: "The thread presents a claim about festival programming as settled fact.",
    status: "open",
    createdAt: "2026-11-11T08:20:00Z",
    notes: [],
  },
  {
    id: "rep_s3",
    target: { type: "reply", id: "r_28" },
    reporterId: "m_fatou",
    reason: "harassment",
    details: "Dismissive towards a named critic in a way that feels personal.",
    status: "escalated",
    createdAt: "2026-11-09T16:40:00Z",
    escalatedAt: "2026-11-09T18:00:00Z",
    notes: [
      { id: "n2", authorId: "m_demo_moderator", body: "Tone is sharp but it critiques the critic's argument. Escalating for a second opinion on account action.", createdAt: "2026-11-09T18:00:00Z" },
    ],
  },
  {
    id: "rep_s4",
    target: { type: "reply", id: "r_06" },
    reporterId: "m_kofi",
    reason: "spam",
    status: "cleared",
    createdAt: "2026-11-08T12:00:00Z",
    resolution: "No action: a genuine thank-you, not spam.",
    notes: [
      { id: "n3", authorId: "m_demo_moderator", body: "Reviewed. Not spam.", createdAt: "2026-11-08T13:30:00Z" },
    ],
  },
  {
    id: "rep_s5",
    target: { type: "discussion", id: "d_07" },
    reporterId: "m_demo_waitlisted",
    reason: "other",
    details: "Is this promotion for the poster's own releases?",
    status: "open",
    createdAt: "2026-11-11T10:05:00Z",
    notes: [],
  },
  {
    id: "rep_s6",
    target: { type: "reply", id: "r_20" },
    reporterId: "m_obinna",
    reason: "off_topic",
    status: "resolved",
    createdAt: "2026-11-05T09:10:00Z",
    resolution: "Reviewed by an admin. Content stays visible.",
    notes: [],
  },
];
