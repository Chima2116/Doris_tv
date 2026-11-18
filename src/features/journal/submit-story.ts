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

export type MyStory = { id: string; title: string; type: string; status: "pending" | "approved" | "declined"; submittedAt: string; reviewNote?: string };

/** The signed-in filmmaker's own stories, newest first. Row level security limits this to their own. */
export async function listMyStories(): Promise<MyStory[]> {
  const supabase = await sessionReady();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("journal_stories")
    .select("id, title, type, status, submitted_at, review_note")
    .order("submitted_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    type: r.type as string,
    status: r.status as MyStory["status"],
    submittedAt: r.submitted_at as string,
    reviewNote: (r.review_note as string | null) ?? undefined,
  }));
}
