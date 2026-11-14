import type { Discussion } from "@/data/types";

export const DISCUSSION_CATEGORIES = [
  "General",
  "Festivals",
  "Craft",
  "Recommendations",
  "Distribution",
  "Industry",
] as const;

const d = (
  id: string,
  authorId: string,
  title: string,
  body: string,
  category: string,
  createdAt: string,
  replyCount: number,
  reactionCount: number,
  extra: Partial<Discussion> = {},
): Discussion => ({
  id,
  authorId,
  title,
  body,
  category,
  createdAt,
  status: "published",
  replyCount,
  reactionCount,
  ...extra,
});

export const DISCUSSIONS: Discussion[] = [
  d("d_01", "m_demo_member", "Is the festival circuit still working for independent filmmakers?", "Three years ago the big festivals felt like a genuinely independent space. Now I'm not sure what they're optimising for. What are people seeing, as filmmakers or as audiences?", "Festivals", "2026-11-11T09:30:00Z", 14, 42),
  d("d_02", "m_zainab", "Looking for Hausa-language independent films from the last five years", "Everything I find is mainstream. There has to be more out there. Recommendations from anyone who has seen screenings, shorts included.", "Recommendations", "2026-11-10T17:10:00Z", 22, 31),
  d("d_03", "m_obinna", "What does film school actually teach about African cinema?", "I'm writing something on the gap between what is being made and what is being taught. If you studied film anywhere on the continent, what was on the syllabus?", "Industry", "2026-11-10T08:00:00Z", 36, 120),
  d("d_04", "m_tolu", "Notes on long takes in recent films: craft or crutch?", "After Temi Adeyemi's interview I've been counting the long takes in recent releases. Some feel earned, some feel like a style. How do you tell the difference?", "Craft", "2026-11-09T19:45:00Z", 9, 54),
  d("d_05", "m_kofi", "Best practices for shooting in a single location?", "Planning a small shoot in one family compound, inspired by the Esi Mensah-Boateng piece. Any tips on coverage and keeping a limited location visually alive?", "Craft", "2026-11-08T12:20:00Z", 17, 38),
  d("d_06", "m_fatou", "Starting a film club: what worked for you?", "We run a small monthly screening in Dakar and want to grow it carefully. How do you balance programming with building a regular audience?", "General", "2026-11-07T15:05:00Z", 12, 47),
  d("d_07", "m_demo_filmmaker", "Distribution strategies for short documentaries", "Sharing what I've learned releasing shorts: festival windows, community screenings and online premieres. Happy to answer questions, and keen to hear what has worked for you.", "Distribution", "2026-11-06T10:40:00Z", 19, 66),
  d("d_08", "m_demo_new_member", "Who are the best DP and director pairings in African film?", "Thinking about Wanjiru Kamau's work and wondering which collaborations people consider the strongest, and why.", "Craft", "2026-11-05T14:15:00Z", 11, 29),
  d("d_09", "m_demo_moderator", "Community guidelines: how we talk about each other's work", "A reminder of how we keep discussion generous and specific here: critique the work, not the person, and say what you saw.", "General", "2026-11-03T09:00:00Z", 6, 51),
  d("d_10", "m_john", "Is the Lagos film a genre now?", "Between the interviews and the recent releases it feels like 'a Lagos film' has a recognisable shape. Is that useful or limiting?", "General", "2026-11-02T18:30:00Z", 25, 73),
];
