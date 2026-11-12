"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Discussion, Member } from "@/data/types";
import { mergeDiscussions } from "@/features/community/community-data";
import { useCommunityState } from "@/features/community/community-store";
import { applyMemberPatch, useMemberStore } from "@/features/members/member-store";
import { members as actions } from "./admin-actions";
import { AdminPageHeader, AdminSkeleton, AdminTable, DetailSheet, FilterBar, FilterSelect, SearchBox, Td, Th, fmt, fmtTime, useAdminReady } from "./ui";

export function MembersAdmin({ members, discussions }: { members: Member[]; discussions: Discussion[] }) {
  const { ready, actor } = useAdminReady();
  const params = useSearchParams();
  const ms = useMemberStore();
  const comm = useCommunityState();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [modOpen, setModOpen] = useState(false);
  const [choice, setChoice] = useState<"keep" | "hide" | "">("");
  const [choiceError, setChoiceError] = useState(false);
  const [reason, setReason] = useState("");

  if (!ready || !actor) return <AdminSkeleton />;

  const all = members.map((m) => applyMemberPatch(m, ms.patches));
  const ds = mergeDiscussions(discussions, comm);
  const publicDiscussions = (id: string) => ds.filter((d) => d.authorId === id && d.status === "published");
  const rows = all
    .filter((m) => (status === "all" ? true : m.accountStatus === status))
    .filter((m) => (role === "all" ? true : m.roles.includes(role as Member["roles"][number])))
    .filter((m) => !q.trim() || `${m.displayName} ${m.username} ${m.location ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));
  const open = all.find((m) => m.id === openId);
  const isAdminAccount = !!open?.roles.includes("admin");
  const isSelf = open?.id === actor.id;
  const pubCount = open ? publicDiscussions(open.id).length : 0;

  const closeSuspend = (o: boolean) => {
    setSuspendOpen(o);
    if (!o) { setChoice(""); setChoiceError(false); setReason(""); }
  };

  return (
    <div>
      <AdminPageHeader title="Members" description="Search members, manage moderator roles and suspend or reactivate accounts. Account status always overrides role." />
      <FilterBar>
        <SearchBox value={q} onChange={setQ} label="Search members" placeholder="Search name, username, location" />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, { value: "active", label: "Active" }, { value: "suspended", label: "Suspended" }, { value: "restricted", label: "Restricted" }]} />
        <FilterSelect label="Role" value={role} onChange={setRole} options={[{ value: "all", label: "All roles" }, { value: "member", label: "Member" }, { value: "filmmaker", label: "Filmmaker" }, { value: "moderator", label: "Moderator" }, { value: "admin", label: "Admin" }]} />
        <p className="ml-auto text-sm text-muted-foreground" role="status" aria-live="polite">{rows.length} {rows.length === 1 ? "member" : "members"}</p>
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No members match" description="Try a different search or filter." action={{ label: "Clear filters", onClick: () => { setQ(""); setStatus("all"); setRole("all"); } }} />
      ) : (
        <AdminTable caption="Members" minWidth="min-w-[50rem]">
          <thead><tr><Th>Member</Th><Th>Roles</Th><Th>Status</Th><Th>Email</Th><Th>Joined</Th><Th className="text-right">Action</Th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="hover:bg-white/[0.02]">
                <Td><span className="font-semibold">{m.displayName}</span><span className="block text-xs text-muted-foreground">@{m.username}</span></Td>
                <Td><span className="flex flex-wrap gap-1">{m.roles.map((r) => <Badge key={r} variant={r === "admin" ? "gold" : "outline"}>{r}</Badge>)}</span></Td>
                <Td><StatusBadge status={m.accountStatus} /></Td>
                <Td><StatusBadge status={m.emailVerified ? "verified" : "unverified"} /></Td>
                <Td className="whitespace-nowrap text-muted-foreground">{fmt(m.memberSince)}</Td>
                <Td className="text-right"><Button size="xs" variant="outline" onClick={() => setOpenId(m.id)}>Manage</Button></Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <DetailSheet
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.displayName ?? "Member"}
        description={open ? `@${open.username}` : undefined}
        footer={
          open && !isAdminAccount && !isSelf ? (
            <>
              {open.accountStatus === "suspended" ? (
                <Button onClick={() => setReactivateOpen(true)}>Reactivate account</Button>
              ) : (
                <Button variant="destructive" onClick={() => setSuspendOpen(true)}>Suspend account</Button>
              )}
              <Button variant="outline" onClick={() => setModOpen(true)}>{open.roles.includes("moderator") ? "Remove moderator role" : "Make moderator"}</Button>
            </>
          ) : undefined
        }
      >
        {open && (
          <>
            <div className="mb-5 flex flex-wrap gap-2"><StatusBadge status={open.accountStatus} />{open.roles.map((r) => <Badge key={r} variant="outline">{r}</Badge>)}</div>
            {(isAdminAccount || isSelf) && <p className="mb-5 border border-dashed border-border p-3 text-xs text-muted-foreground">{isSelf ? "You can't change your own account here." : "Administrator accounts can't be suspended or changed from this screen."}</p>}
            {open.accountStatus === "suspended" && open.suspension && (
              <div className="mb-6 border border-danger/40 bg-danger/5 p-4 text-sm">
                <p className="type-eyebrow mb-1 text-[#ee8585]">Suspended {fmtTime(open.suspension.at)}</p>
                {open.suspension.reason && <p>{open.suspension.reason}</p>}
                <p className="mt-2 text-xs text-muted-foreground">Existing public discussions at the time: <strong className="text-foreground">{open.suspension.discussions === "hide" ? "hidden" : "kept visible"}</strong></p>
              </div>
            )}
            <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              <dt className="text-muted-foreground">Location</dt><dd>{open.location ?? "—"}</dd>
              <dt className="text-muted-foreground">Joined</dt><dd>{fmt(open.memberSince)}</dd>
              <dt className="text-muted-foreground">Email</dt><dd>{open.emailVerified ? "Verified" : "Not verified"}</dd>
              <dt className="text-muted-foreground">Waitlist</dt><dd>{open.waitlistLinked ? "Linked" : "Not linked"}</dd>
              <dt className="text-muted-foreground">Profile</dt><dd className="capitalize">{open.profileVisibility}</dd>
              <dt className="text-muted-foreground">Public discussions</dt><dd>{pubCount}</dd>
            </dl>
            {open.bio && <p className="mt-5 text-sm leading-relaxed text-reading/80">{open.bio}</p>}
          </>
        )}
      </DetailSheet>

      {open && (
        <>
          {/* Suspension requires an explicit decision about existing public discussions. */}
          <Dialog open={suspendOpen} onOpenChange={closeSuspend}>
            <DialogContent className="max-w-lg">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!choice) { setChoiceError(true); return; }
                  actions.suspend(actor, open, { reason: reason.trim() || undefined, discussions: choice, publishedDiscussionIds: publicDiscussions(open.id).map((d) => d.id) });
                  toast.success(`${open.displayName} suspended. Existing discussions ${choice === "hide" ? "hidden" : "kept visible"}.`);
                  closeSuspend(false);
                }}
              >
                <DialogHeader>
                  <DialogTitle>Suspend {open.displayName}?</DialogTitle>
                  <DialogDescription>
                    They won&apos;t be able to take part in the Community, and any moderator or admin powers switch off. Nothing is hidden or deleted unless you choose it below.
                  </DialogDescription>
                </DialogHeader>
                <fieldset className="my-5">
                  <legend className="mb-3 text-sm font-semibold">Their {pubCount} existing public {pubCount === 1 ? "discussion" : "discussions"} <span className="text-[#ee8585]">(required)</span></legend>
                  <RadioGroup value={choice} onValueChange={(v) => { setChoice(v as "keep" | "hide"); setChoiceError(false); }} className="gap-3" aria-invalid={choiceError}>
                    {[
                      ["keep", "Keep them visible", "Their discussions stay public."],
                      ["hide", "Hide them", "Their public discussions are hidden until an administrator restores them."],
                    ].map(([v, l, d]) => (
                      <div key={v} className="flex items-start gap-3">
                        <RadioGroupItem id={`sd-${v}`} value={v} className="mt-1" />
                        <Label htmlFor={`sd-${v}`} className="grid gap-0.5 font-normal"><span className="font-semibold">{l}</span><span className="text-xs text-muted-foreground">{d}</span></Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {choiceError && <p role="alert" className="mt-2 text-sm text-[#ee8585]">Choose what happens to their existing discussions.</p>}
                </fieldset>
                <div className="grid gap-2">
                  <Label htmlFor="sus-reason">Reason <span className="font-normal text-muted-foreground">(optional, internal)</span></Label>
                  <Textarea id="sus-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="ghost" onClick={() => closeSuspend(false)}>Cancel</Button>
                  <Button type="submit" variant="destructive">Suspend account</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <ConfirmDialog
            open={reactivateOpen}
            onOpenChange={setReactivateOpen}
            title={`Reactivate ${open.displayName}?`}
            description="Their account becomes active again. This doesn't restore or change any content that was hidden; restore content from Moderation if needed."
            confirmLabel="Reactivate"
            onConfirm={() => { actions.reactivate(actor, open); toast.success(`${open.displayName} reactivated`); }}
          />
          <ConfirmDialog
            open={modOpen}
            onOpenChange={setModOpen}
            title={open.roles.includes("moderator") ? `Remove ${open.displayName} as moderator?` : `Make ${open.displayName} a moderator?`}
            description={open.roles.includes("moderator") ? "They'll lose access to the moderation queue." : "They'll be able to review reports, hide content pending admin review, add notes and escalate. They can't permanently delete anything."}
            confirmLabel={open.roles.includes("moderator") ? "Remove role" : "Make moderator"}
            onConfirm={() => { actions.setModerator(actor, open, !open.roles.includes("moderator")); toast.success("Role updated"); }}
          />
        </>
      )}
    </div>
  );
}
