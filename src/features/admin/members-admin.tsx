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
import { DetailCallout, DetailRows, DetailSection, AdminPageHeader, AdminSkeleton, AdminTable, DetailSheet, FilterBar, FilterSelect, SearchBox, Td, Th, fmt, fmtTime, useAdminReady } from "./ui";

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
                <Td><span className="flex flex-wrap gap-1">{m.roles.filter((r) => r !== "member").map((r) => <Badge key={r} variant={r === "admin" ? "gold" : "outline"}>{r}</Badge>)}{m.roles.every((r) => r === "member") && <span className="text-xs text-white/55">Member</span>}</span></Td>
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
        kicker="Member"
        title={open?.displayName ?? "Member"}
        subtitle={open ? `@${open.username}` : undefined}
        badges={open && <><StatusBadge status={open.accountStatus} />{open.roles.filter((r) => r !== "member").map((r) => <Badge key={r} variant="outline" className="capitalize">{r}</Badge>)}</>}
        facts={open ? [
          { label: "Location", value: open.location ?? "—" },
          { label: "Joined", value: fmt(open.memberSince) },
          { label: "Public discussions", value: pubCount },
          { label: "Email", value: open.emailVerified ? "Verified" : "Not verified" },
        ] : undefined}
        footer={
          open && !isAdminAccount && !isSelf ? (
            <>
              {open.accountStatus === "suspended" ? (
                <Button onClick={() => setReactivateOpen(true)}>Reactivate account</Button>
              ) : (
                <Button variant="destructive" onClick={() => setSuspendOpen(true)}>Suspend account</Button>
              )}
              <div className="flex flex-col gap-1.5">
                <Button variant="outline" disabled={!open.roles.includes("moderator") && !open.emailVerified} onClick={() => setModOpen(true)}>{open.roles.includes("moderator") ? "Remove moderator role" : "Make moderator"}</Button>
                {!open.roles.includes("moderator") && !open.emailVerified && <p className="text-xs text-white/60">Needs a verified email first.</p>}
              </div>
            </>
          ) : undefined
        }
      >
        {open && (
          <>
            {open.accountStatus === "suspended" && open.suspension && (
              <DetailCallout tone="danger" label={`Suspended ${fmtTime(open.suspension.at)}`}>
                {open.suspension.reason && <p>{open.suspension.reason}</p>}
                <p className="mt-2 text-xs text-white/60">Existing public discussions: <span className="font-semibold text-white">{open.suspension.discussions === "hide" ? "hidden" : "kept visible"}</span></p>
              </DetailCallout>
            )}
            {(isAdminAccount || isSelf) && (
              <p className="mb-7 border border-dashed border-white/15 p-4 text-xs text-white/60">{isSelf ? "You can't change your own account here." : "Administrator accounts can't be suspended or changed here."}</p>
            )}
            <DetailSection title="Profile">
              {open.bio ? <p className="text-[0.9375rem] leading-relaxed text-white/80">{open.bio}</p> : <p className="text-sm text-white/60">No bio yet.</p>}
              <p className="mt-4 text-xs capitalize text-white/55">Profile visibility: <span className="text-white/85">{open.profileVisibility}</span></p>
            </DetailSection>
            <DetailSection title="Account standing">
              <DetailRows rows={[
                { primary: "Base role", end: "Member (every account)" },
                { primary: "Email", end: open.emailVerified ? "Verified" : "Not verified" },
                { primary: "Public discussions", end: pubCount },
              ]} />
            </DetailSection>
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
