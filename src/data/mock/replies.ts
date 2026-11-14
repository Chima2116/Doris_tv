import type { Reply } from "@/data/types";

const r = (
  id: string,
  discussionId: string,
  authorId: string,
  body: string,
  createdAt: string,
  reactionCount = 0,
  extra: Partial<Reply> = {},
): Reply => ({ id, discussionId, authorId, body, createdAt, status: "published", reactionCount, ...extra });

/** Seed replies. Visible reply counts are derived from these plus anything members add. */
export const REPLIES: Reply[] = [
  // d_01 festivals
  r("r_01", "d_01", "m_obinna", "I think the pressure is the premiere requirement. Programmers want world premieres, so films wait months in limbo and lose momentum. Smaller regional festivals have been better about this.", "2026-11-11T10:05:00Z", 12),
  r("r_02", "d_01", "m_demo_filmmaker", "As a filmmaker, the fees alone are the issue. Submission costs add up fast and you rarely get feedback. I now pick two festivals I genuinely care about and skip the rest.", "2026-11-11T11:20:00Z", 18),
  r("r_03", "d_01", "m_fatou", "From the audience side, the best discoveries I've made were at tiny festivals with a handful of films and a lot of conversation.", "2026-11-11T11:45:00Z", 9, { editedAt: "2026-11-11T11:55:00Z" }),
  // d_02 hausa
  r("r_04", "d_02", "m_demo_member", "Try looking at shorts programmes at the Abuja and Kano screenings. A few directors there are doing exactly this work and rarely get online.", "2026-11-10T18:30:00Z", 7),
  r("r_05", "d_02", "m_tolu", "The Northern Voices retrospective in the Journal has a useful starting list, even if it only covers five films.", "2026-11-10T19:05:00Z", 11),
  r("r_06", "d_02", "m_zainab", "Thank you both. I'll start there and report back with what I find.", "2026-11-10T20:00:00Z", 3),
  // d_03 film school
  r("r_07", "d_03", "m_kofi", "In Kumasi we spent a semester on European new waves and one lecture on African cinema. Most of what I know came from film clubs.", "2026-11-10T09:15:00Z", 21),
  r("r_08", "d_03", "m_fatou", "Same experience in Dakar, except our film clubs were the curriculum. It would be great to compare syllabi across schools.", "2026-11-10T10:40:00Z", 14),
  r("r_09", "d_03", "m_demo_new_member", "I'd happily share mine. It would be interesting to see where the gaps are by country.", "2026-11-10T12:00:00Z", 6),
  r("r_10", "d_03", "m_obinna", "That's exactly the kind of thing I'm hoping to collect. I'll start a shared list in the thread.", "2026-11-10T13:30:00Z", 8),
  // d_04 long takes
  r("r_11", "d_04", "m_demo_member", "For me it's whether the shot gives the audience something to do. If the camera is just holding, it's style. If I'm reading faces and spaces, it's craft.", "2026-11-09T20:30:00Z", 15),
  r("r_12", "d_04", "m_demo_filmmaker", "Practical note: long takes are also cheaper to light and schedule in some conditions, so be careful about reading every one as an aesthetic choice.", "2026-11-09T21:10:00Z", 10),
  r("r_13", "d_04", "m_tolu", "Fair point on the practical side. I'll count those separately next time.", "2026-11-09T22:00:00Z", 2, { status: "hidden", hiddenReason: "Hidden by a moderator pending admin review." }),
  // d_05 single location
  r("r_14", "d_05", "m_demo_filmmaker", "Map the space before you shoot: where light comes from at each hour, which doorways give you depth. A compound has more angles than you think.", "2026-11-08T13:00:00Z", 17),
  r("r_15", "d_05", "m_demo_new_member", "Sound helps too. Different rooms and surfaces make a single location feel like several places.", "2026-11-08T14:30:00Z", 8),
  r("r_16", "d_05", "m_kofi", "Great tips. The lighting-by-hour idea is going straight into my shot list.", "2026-11-08T15:45:00Z", 4),
  // d_06 film club
  r("r_17", "d_06", "m_demo_member", "A regular slot matters more than the programming. People came back because they knew when it was on.", "2026-11-07T16:00:00Z", 13),
  r("r_18", "d_06", "m_demo_new_member", "We invited a filmmaker or writer for a short conversation after each screening, and that built the regular audience faster than anything else.", "2026-11-07T17:20:00Z", 16),
  r("r_19", "d_06", "m_fatou", "Both very helpful. A fixed slot and a guest conversation: noted.", "2026-11-07T18:00:00Z", 5),
  // d_07 distribution
  r("r_20", "d_07", "m_zainab", "Community screenings sound the most promising for documentaries. Did you find audiences came for the topic or the filmmaker?", "2026-11-06T11:15:00Z", 6),
  r("r_21", "d_07", "m_demo_filmmaker", "Mostly the topic, but the post-screening discussion is what gets them to share it afterwards. I always build one in.", "2026-11-06T12:00:00Z", 9),
  r("r_22", "d_07", "m_obinna", "Worth adding: online premieres work better when paired with a live conversation, otherwise they disappear into the feed.", "2026-11-06T13:40:00Z", 12),
  // d_08 DP pairings
  r("r_23", "d_08", "m_kofi", "I'd say the best pairings are the ones that share a visual vocabulary before the shoot. Look at how often the same two names appear together on credits.", "2026-11-05T15:00:00Z", 7),
  r("r_24", "d_08", "m_demo_member", "Wanjiru Kamau's work with East African directors is a good case. The landscapes feel like characters, not backdrops.", "2026-11-05T16:30:00Z", 10),
  // d_09 guidelines
  r("r_25", "d_09", "m_demo_member", "Thank you for writing this down. 'Say what you saw' is a good rule for any critique.", "2026-11-03T10:00:00Z", 8),
  r("r_26", "d_09", "m_obinna", "Agreed. Specific beats clever every time.", "2026-11-03T11:00:00Z", 4),
  // d_10 Lagos film
  r("r_27", "d_10", "m_demo_member", "It's a useful shorthand but it flattens a lot of difference. Ijora and Ikoyi films have almost nothing in common.", "2026-11-02T19:00:00Z", 19),
  r("r_28", "d_10", "m_tolu", "Partly it's a marketing category now. Critics and festivals want a 'Lagos film' because it's easy to describe.", "2026-11-02T20:15:00Z", 14),
  r("r_29", "d_10", "m_demo_filmmaker", "As someone who shoots there: the city isn't a genre, but the way of working (fast, close, improvised) does shape the films.", "2026-11-02T21:30:00Z", 23),
];
