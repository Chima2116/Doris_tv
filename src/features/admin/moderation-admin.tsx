"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Discussion, Member, ModerationReport, Reply } from "@/data/types";
import { mergeDiscussions, mergeReplies, mergeReports } from "@/features/community/community-data";
import { useCommunityState } from "@/features/community/community-store";
import { applyMemberPatch, useMemberStore } from "@/features/members/member-store";
import { isAdmin } from "@/lib/permissions";
import { moderation as actions } from "./admin-actions";
import { AdminPageHeader, AdminSkeleton, AdminTable, DetailSheet, PrototypeNote, Td, Th, fmtTime, useAdminReady } from "./ui";

const TABS = [
  { value: "open", label: "Open", match: (r: ModerationReport) => r.status === "open" },
  { value: "escalated", label: "Escalated", match: (r: ModerationReport) => r.status === "escalated" },
  { value: "hidden", label: "Hidden", match: (r: ModerationReport) => r.status === "hidden" },
  { value: "closed", label: "Closed", match: (r: ModerationReport) => r.status === "cleared" || r.status === "resolved" },
  { value: "all", label: "All", match: () => true },
];

const REASON: Record<string, string> = { spam: "Spam or promotion", harassment: "Harassment or abuse", off_topic: "Off topic", misinformation: "Misinformation", other: "Something else" };
const excerpt = (s: string, n = 70) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);

export function ModerationAdmin({ reports, discussions, replies, members }: { reports: ModerationReport[]; discussions: Discussion[]; replies: Reply[]; members: Member[] }) {
  const { ready, actor } = useAdminReady();
  const comm = useCommunityState();
  const ms = useMemberStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | "hide" | "restore" | "remove">(null);

  if (!ready || !actor) return <AdminSkeleton />;
  const admin = isAdmin(actor);

  const all = mergeReports(reports, comm).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const ds = mergeDiscussions(discussions, comm);
  const rs = mergeReplies(replies, comm);
  const mem = members.map((m) => applyMemberPatch(m, ms.patches));
  const person = (id: string) => (id === "system" ? undefined : mem.find((m) => m.id === id));

  const content = (r: ModerationReport) => {
    if (r.target.type === "discussion") {
      const d = ds.find((x) => x.id === r.target.id);
      return d && { title: d.title, text: d.body, status: d.status, authorId: d.authorId, href: `/community/${d.id}`, hiddenReason: d.hiddenReason };
    }
    const re = rs.find((x) => x.id === r.target.id);
    return re && { title: ds.find((x) => x.id === re.discussionId)?.title ?? "A discussion", text: re.body, status: re.status, authorId: re.authorId, href: `/community/${re.discussionId}#${re.id}`, hiddenReason: re.hiddenReason };
  };

  const open = all.find((r) => r.id === openId);
  const c = open && content(open);
  const author = c && person(c.authorId);
  const canAct = open && (open.status === "open" || open.status === "hidden" || open.status === "escalated");
  const decided = open && (open.status === "cleared" || open.status === "resolved");

  const addNote = () => {
    if (!open) return;
    if (noteDraft.trim().length < 3) { setNoteError("Write a short note first."); return; }
    actions.addNote(actor, open, noteDraft.trim());
    setNoteDraft(""); setNoteError(null);
    toast.success("Note added");
  };

  const table = (rows: ModerationReport[]) =>
    rows.length === 0 ? (
      <EmptyState icon={<ShieldCheck />} title="No outstanding reports" description="Nothing needs review in this view. New reports from members will appear here." />
    ) : (
      <AdminTable caption="Moderation reports" minWidth="min-w-[52rem]">
        <thead><tr><Th>Reported content</Th><Th>Type</Th><Th>Reason</Th><Th>Reporter</Th><Th>Reported</Th><Th>Status</Th><Th className="text-right">Action</Th></tr></thead>
        <tbody>
          {rows.map((r) => {
            const ct = content(r);
            return (
              <tr key={r.id} className="hover:bg-white/[0.02]">
                <Td className="max-w-xs"><span className="line-clamp-2">{ct ? excerpt(ct.text) : "Content no longer available"}</span></Td>
                <Td className="whitespace-nowrap capitalize">{r.target.type}</Td>
                <Td>{REASON[r.reason]}</Td>
                <Td>{person(r.reporterId)?.displayName ?? "Member"}</Td>
                <Td className="whitespace-nowrap text-muted-foreground">{fmtTime(r.createdAt)}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td className="text-right"><Button size="xs" variant="outline" onClick={() => setOpenId(r.id)}>Review</Button></Td>
              </tr>
            );
          })}
        </tbody>
      </AdminTable>
    );

  return (
    <div>
      <AdminPageHeader title="Moderation" description="Review reported discussions and replies. Hide content pending admin review, add notes, or escalate." />
      {!admin && <PrototypeNote>You&apos;re signed in as a moderator. You can review, add notes, hide pending admin review and escalate. Restoring or permanently deleting content needs an administrator.</PrototypeNote>}
      <Tabs defaultValue="open">
        <TabsList>
          {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label} ({all.filter(t.match).length})</TabsTrigger>)}
        </TabsList>
        {TABS.map((t) => <TabsContent key={t.value} value={t.value}>{table(all.filter(t.match))}</TabsContent>)}
      </Tabs>

      <DetailSheet
        open={!!open}
        onOpenChange={(o) => { if (!o) { setOpenId(null); setNoteDraft(""); setNoteError(null); } }}
        title="Report details"
        description={open ? `${REASON[open.reason]} · ${open.target.type}` : undefined}
        footer={
          open && canAct ? (
            <>
              {open.status === "open" && <Button variant="outline" onClick={() => { actions.clear(actor, open); toast.success("Report cleared. Reporter notified (simulated)."); }}>Clear (no action)</Button>}
              {open.status === "open" && <Button variant="outline" onClick={() => setConfirm("hide")}>Hide pending review</Button>}
              {open.status !== "escalated" && <Button variant="outline" onClick={() => { actions.escalate(actor, open); toast.success("Escalated to an administrator"); }}>Escalate to admin</Button>}
              {admin && (open.status === "hidden" || open.status === "escalated") && <Button onClick={() => setConfirm("restore")}>Restore content</Button>}
              {admin && <Button variant="destructive" onClick={() => setConfirm("remove")}>Delete permanently</Button>}
              {admin && open.status === "escalated" && <Button variant="outline" onClick={() => { actions.clear(actor, open); toast.success("Report cleared"); }}>Clear (no action)</Button>}
              {!admin && <p className="w-full text-xs text-muted-foreground">Only administrators can restore or permanently delete content.</p>}
            </>
          ) : undefined
        }
      >
        {open && (
          <>
            <div className="mb-5 flex items-center gap-3"><StatusBadge status={open.status} /><span className="text-xs text-muted-foreground">Reported {fmtTime(open.createdAt)}</span></div>

            <h3 className="type-eyebrow mb-2 font-sans text-white/75">Reported {open.target.type}</h3>
            {c ? (
              <div className="mb-6 border border-border p-4">
                <p className="text-xs text-muted-foreground">In: {c.title}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-reading">{c.text}</p>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>By <strong className="text-foreground">{author?.displayName ?? "Unknown"}</strong></span>
                  <StatusBadge status={c.status} />
                  <Link href={c.href} target="_blank" className="text-gold underline">View in Community</Link>
                  {admin && author && <Link href={`/admin/members?q=${author.username}`} className="text-gold underline">Manage member</Link>}
                </p>
                {c.hiddenReason && <p className="mt-2 text-xs text-warning">{c.hiddenReason}</p>}
              </div>
            ) : <p className="mb-6 text-sm text-muted-foreground">This content is no longer available.</p>}

            <h3 className="type-eyebrow mb-2 font-sans text-white/75">Report</h3>
            <dl className="mb-6 grid grid-cols-[6rem_1fr] gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Category</dt><dd>{REASON[open.reason]}</dd>
              <dt className="text-muted-foreground">Reported by</dt><dd>{person(open.reporterId)?.displayName ?? "Member"}</dd>
              {open.details && (<><dt className="text-muted-foreground">Details</dt><dd>{open.details}</dd></>)}
              {open.resolution && (<><dt className="text-muted-foreground">Outcome</dt><dd>{open.resolution}</dd></>)}
            </dl>

            <h3 className="type-eyebrow mb-2 font-sans text-white/75">Moderator notes</h3>
            {open.notes.length === 0 ? <p className="mb-4 text-sm text-muted-foreground">No notes yet.</p> : (
              <ul className="mb-4 space-y-3">
                {open.notes.map((n) => (
                  <li key={n.id} className="border-l-2 border-border pl-3 text-sm">
                    <p>{n.body}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{person(n.authorId)?.displayName ?? "DORIS TV"} · {fmtTime(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
            {!decided && (
              <div className="grid gap-2">
                <Label htmlFor="mod-note">Add a note</Label>
                <Textarea id="mod-note" rows={3} value={noteDraft} aria-invalid={!!noteError} onChange={(e) => setNoteDraft(e.target.value)} />
                {noteError && <p role="alert" className="text-sm text-[#ee8585]">{noteError}</p>}
                <Button size="sm" variant="outline" className="w-fit" onClick={addNote}>Add note</Button>
              </div>
            )}
          </>
        )}
      </DetailSheet>

      {open && (
        <>
          <ConfirmDialog
            open={confirm === "hide"}
            onOpenChange={(o) => !o && setConfirm(null)}
            title="Hide this content pending admin review?"
            description="It will be hidden from the public. Nothing is deleted, and an administrator can restore it."
            confirmLabel="Hide content"
            onConfirm={() => { actions.hide(actor, open); toast.success("Content hidden pending admin review"); }}
          />
          <ConfirmDialog
            open={confirm === "restore"}
            onOpenChange={(o) => !o && setConfirm(null)}
            title="Restore this content?"
            description="It becomes visible to the public again and the report is closed."
            confirmLabel="Restore content"
            onConfirm={() => { actions.restore(actor, open); toast.success("Content restored"); }}
          />
          <ConfirmDialog
            open={confirm === "remove"}
            onOpenChange={(o) => !o && setConfirm(null)}
            title="Delete this content permanently?"
            description="It's removed from the platform and the action is recorded in the audit log. In the live product this can't be undone."
            confirmLabel="Delete permanently"
            destructive
            onConfirm={() => { actions.remove(actor, open); toast.success("Content deleted and logged"); }}
          />
        </>
      )}
    </div>
  );
}
