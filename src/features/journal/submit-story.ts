import { getSupabase, sessionReady } from "@/lib/supabase/client";
import { storyText } from "./story-doc";

/**
 * Sends a filmmaker's story to the admin review queue. It is saved as "pending" in Supabase and
 * stays off the Journal until an admin approves it (see supabase/migrations/0005_journal_stories.sql).
 */
export type StorySubmission = {
  title: string;
  type: string;
  excerpt?: string;
  body: string;
  videoUrl?: string;
  coverCredit?: string;
};

export async function submitStory(story: StorySubmission): Promise<{ ok: true }> {
  const supabase = await sessionReady();
  if (!supabase) throw new Error("Sending stories isn't available yet. Please try again later.");
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) throw new Error("Sign in to send a story.");

  let doc: unknown;
  try {
    doc = JSON.parse(story.body);
  } catch {
    throw new Error("The story couldn't be read. Please try again.");
  }
  const { error } = await supabase.from("journal_stories").insert({
    author_id: uid,
    title: story.title,
    type: story.type,
    excerpt: story.excerpt || null,
    body: doc,
    video_url: story.videoUrl?.trim() || null,
    cover_credit: story.coverCredit || null,
    status: "pending",
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** Plain-text length of a story, used for the character count. */
export { storyText };
