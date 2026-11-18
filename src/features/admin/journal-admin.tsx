"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAdminReady, AdminPageHeader, AdminSkeleton, AdminTable, DetailSection, DetailSheet, FilterBar, FilterSelect, ReasonDialog, Td, Th, fmt } from "./ui";
import { ArticleBody } from "@/features/journal/article-body";
import { docToBlocks, type Doc } from "@/features/journal/story-doc";
import { getSupabase, sessionReady } from "@/lib/supabase/client";

const storySlug = (s: Story) => `${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)}-${s.id.slice(0, 6)}`;

type Story = {
  id: string;
  title: string;
  type: string;
  status: "pending" | "approved" | "declined";
  submittedAt: string;
  authorName: string;
  reviewNote?: string;
  excerpt?: string;
  videoUrl?: string;
  coverCredit?: string;
  body: Doc;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "all", label: "All" },
];

/** Filmmakers' stories waiting for review. Approving or declining is saved in Supabase. */
export function JournalAdmin() {
  const { ready, actor } = useAdminReady();
  const [stories, setStories] = useState<Story[]>([]);
  const [status, setStatus] = useState("pending");
  const [target, setTarget] = useState<Story | null>(null);
  const [action, setAction] = useState<"approve" | "decline" | null>(null);
  const [preview, setPreview] = useState<Story | null>(null);

  async function loadStories(): Promise<Story[]> {
    const supabase = await sessionReady();
    if (!supabase) return [];
    const { data } = await supabase
      .from("journal_stories")
      .select("id, title, type, status, submitted_at, review_note, author_id, excerpt, video_url, cover_credit, body")
      .order("submitted_at", { ascending: false });
    const rows = (data ?? []) as { id: string; title: string; type: string; status: Story["status"]; submitted_at: string; review_note: string | null; author_id: string; excerpt: string | null; video_url: string | null; cover_credit: string | null; body: Doc }[];
    const authorIds = [...new Set(rows.map((r) => r.author_id))];
    const names = new Map<string, string>();
    if (authorIds.length) {
      const { data: profiles } = await supabase.from("profiles").select("id, display_name, username").in("id", authorIds);
      for (const p of (profiles ?? []) as { id: string; display_name: string; username: string }[]) names.set(p.id, `${p.display_name} (@${p.username})`);
    }
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      status: r.status,
      submittedAt: r.submitted_at,
      authorName: names.get(r.author_id) ?? "Filmmaker",
      reviewNote: r.review_note ?? undefined,
      excerpt: r.excerpt ?? undefined,
      videoUrl: r.video_url ?? undefined,
      coverCredit: r.cover_credit ?? undefined,
      body: r.body,
    }));
  }

  useEffect(() => {
    loadStories().then(setStories);
  }, []);

  if (!ready || !actor) return <AdminSkeleton />;

  const rows = stories.filter((s) => status === "all" || s.status === status);

  const decide = async (story: Story, next: "approved" | "declined", note?: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase
      .from("journal_stories")
      .update({ status: next, review_note: note ?? null, decided_at: new Date().toISOString(), ...(next === "approved" ? { slug: storySlug(story) } : {}) })
      .eq("id", story.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(next === "approved" ? `${story.title} approved` : `${story.title} declined`);
    setStories(await loadStories());
  };

  return (
    <div>
      <AdminPageHeader title="Journal" description="Stories filmmakers have sent for review. Approve or decline each one, with a reason for anyone you decline." />
      <FilterBar>
        <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <p className="ml-auto text-sm text-muted-foreground" role="status" aria-live="polite">{rows.length} {rows.length === 1 ? "story" : "stories"}</p>
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No stories here" description="When a filmmaker sends a story, it appears in this list for review." />
      ) : (
        <AdminTable caption="Journal stories">
          <thead>
            <tr>
              <Th>Story</Th><Th>Filmmaker</Th><Th>Type</Th><Th>Sent</Th><Th>Status</Th><Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <Td className="font-semibold">{s.title}</Td>
                <Td>{s.authorName}</Td>
                <Td>{s.type}</Td>
                <Td>{fmt(s.submittedAt)}</Td>
                <Td><StatusBadge status={s.status === "declined" ? "rejected" : s.status === "approved" ? "approved" : "pending"} /></Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setPreview(s)}>Review</Button>
                    {s.status === "pending" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => { setTarget(s); setAction("decline"); }}>Decline</Button>
                        <Button size="sm" onClick={() => { setTarget(s); setAction("approve"); }}>Approve</Button>
                      </>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <DetailSheet
        open={preview !== null}
        onOpenChange={(v) => { if (!v) setPreview(null); }}
        kicker="Story preview"
        title={preview?.title ?? ""}
        subtitle={preview ? `${preview.type} · by ${preview.authorName}` : undefined}
        description={preview?.excerpt}
        facts={preview ? [{ label: "Sent", value: fmt(preview.submittedAt) }, { label: "Status", value: preview.status === "pending" ? "Pending review" : preview.status === "approved" ? "Approved" : "Declined" }] : undefined}
        footer={preview && preview.status === "pending" ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { setTarget(preview); setPreview(null); setAction("decline"); }}>Decline</Button>
            <Button onClick={() => { setTarget(preview); setPreview(null); setAction("approve"); }}>Approve</Button>
          </div>
        ) : undefined}
      >
        {preview && (
          <>
            {preview.videoUrl && (
              <DetailSection title="Video link"><p className="break-all text-sm text-reading/80">{preview.videoUrl}</p></DetailSection>
            )}
            {preview.coverCredit && (
              <DetailSection title="Photo credit"><p className="text-sm text-reading/80">{preview.coverCredit}</p></DetailSection>
            )}
            <DetailSection title="Story">
              <ArticleBody blocks={docToBlocks(preview.body)} />
            </DetailSection>
          </>
        )}
      </DetailSheet>

      <ConfirmDialog
        open={action === "approve"}
        onOpenChange={(v) => { if (!v) setAction(null); }}
        title={`Approve “${target?.title ?? ""}”?`}
        description="The story is marked approved and saved here. Publishing it on the Journal is the next step, so it won't appear there yet."
        confirmLabel="Approve"
        onConfirm={async () => { if (target) await decide(target, "approved"); }}
      />
      <ReasonDialog
        open={action === "decline"}
        onOpenChange={(v) => { if (!v) setAction(null); }}
        title={`Decline “${target?.title ?? ""}”?`}
        description="The filmmaker will see your reason on My journals."
        label="Reason for the filmmaker"
        confirmLabel="Decline story"
        destructive
        onConfirm={async (reason) => { if (target) await decide(target, "declined", reason); }}
      />
    </div>
  );
}
