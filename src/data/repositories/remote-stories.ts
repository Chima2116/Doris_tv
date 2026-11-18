import { connection } from "next/server";
import type { ArticleBlock, JournalArticle } from "@/data/types";
import { getPublicSupabase } from "@/lib/supabase/public";
import { docToBlocks, type Doc } from "@/features/journal/story-doc";

type Row = {
  id: string;
  slug: string | null;
  title: string;
  type: string;
  excerpt: string | null;
  body: Doc;
  video_url: string | null;
  author_id: string;
  decided_at: string | null;
  submitted_at: string;
};

/** Approved filmmaker stories from Supabase, in the same shape as stories from the Studio. */
export async function fetchRemoteArticles(): Promise<JournalArticle[]> {
  // Read on each visit, so an approval shows on the Journal straight away.
  await connection();
  const supabase = getPublicSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("journal_stories")
    .select("id, slug, title, type, excerpt, body, video_url, author_id, decided_at, submitted_at")
    .eq("status", "approved")
    .not("slug", "is", null);
  if (error || !data) return [];
  const rows = data as Row[];
  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  const names = new Map<string, string>();
  if (authorIds.length) {
    const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", authorIds);
    for (const p of (profiles ?? []) as { id: string; display_name: string }[]) names.set(p.id, p.display_name);
  }
  return rows.map((r) => {
    const blocks = docToBlocks(r.body);
    const words = blocks.reduce((n, b) => n + ("text" in b ? b.text.split(/\s+/).length : 0), 0);
    const publishedAt = r.decided_at ?? r.submitted_at;
    return {
      id: r.id,
      slug: r.slug as string,
      title: r.title,
      deck: r.excerpt ?? undefined,
      coverImage: "",
      videoUrl: r.video_url ?? undefined,
      coverAlt: r.title,
      category: r.type,
      author: names.get(r.author_id) ?? "Filmmaker",
      publishedAt,
      readingTime: Math.max(1, Math.round(words / 220)),
      featured: false,
      status: "published",
      body: blocks,
    } as JournalArticle;
  });
}
