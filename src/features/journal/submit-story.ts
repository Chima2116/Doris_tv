/**
 * Sends a filmmaker's journal to the review queue in the Studio as "pending".
 *
 * NOT CONNECTED YET. Once sign-in is set up (Supabase) and a server-side write key exists for
 * Sanity, this will create a journalStory with status "pending" and submittedBy set to the
 * filmmaker's name. Until then it only reports success so the form and confirmation can be tested.
 */
export type StorySubmission = {
  title: string;
  type: string;
  excerpt?: string;
  body: string;
  videoUrl?: string;
  coverImage?: File;
  coverCredit?: string;
};

export async function submitStory(_story: StorySubmission): Promise<{ ok: true }> {
  return { ok: true };
}
