"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { FilmmakerApplication } from "@/data/types";
import { mergeApplications, useApplicationsState } from "@/features/applications/applications-store";
import { applications as actions } from "./admin-actions";
import { AdminPageHeader, AdminSkeleton, AdminTable, DetailCallout, DetailRows, DetailSection, DetailSheet, DetailTimeline, FilterBar, FilterSelect, ReasonDialog, SearchBox, Td, Th, fmt, fmtTime, useAdminReady } from "./ui";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function ApplicationsAdmin({ seed }: { seed: FilmmakerApplication[] }) {
  const { ready, actor } = useAdminReady();
  const state = useApplicationsState();
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);

  if (!ready || !actor) return <AdminSkeleton />;

  // Admins review submitted work; drafts are the applicant's own.
  const all = mergeApplications(seed, state).filter((a) => a.status !== "draft");
  const rows = all
    .filter((a) => (status === "all" ? true : a.status === status))
    .filter((a) => !q.trim() || `${a.details.fullName} ${a.details.country} ${a.details.primaryDiscipline}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (b.submittedAt ?? b.createdAt).localeCompare(a.submittedAt ?? a.createdAt));
  const open = all.find((a) => a.id === openId);
  const d = open?.details;
  const canDecide = open && (open.status === "submitted" || open.status === "under_review");

  return (
    <div>
      <AdminPageHeader title="Filmmaker applications" description="Review applications for a verified filmmaker profile. Approving creates the profile; rejecting requires a reason the applicant will see." />
      <FilterBar>
        <SearchBox value={q} onChange={setQ} label="Search applicants" placeholder="Search name, country, discipline" />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <p className="ml-auto text-sm text-muted-foreground" role="status" aria-live="polite">{rows.length} {rows.length === 1 ? "application" : "applications"}</p>
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No applications match" description="Try a different status or search term." action={{ label: "Clear filters", onClick: () => { setStatus("all"); setQ(""); } }} />
      ) : (
        <AdminTable caption="Filmmaker applications">
          <thead>
            <tr>
              <Th>Applicant</Th><Th>Discipline</Th><Th>Country</Th><Th>Submitted</Th><Th>Status</Th><Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-white/[0.02]">
                <Td className="font-semibold">{a.details.fullName}</Td>
                <Td>{a.details.primaryDiscipline}</Td>
                <Td>{a.details.country}</Td>
                <Td className="text-muted-foreground">{a.submittedAt ? fmt(a.submittedAt) : "—"}</Td>
                <Td><StatusBadge status={a.status} /></Td>
                <Td className="text-right"><Button size="xs" variant="outline" onClick={() => setOpenId(a.id)}>Review</Button></Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <DetailSheet
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        kicker="Filmmaker application"
        title={d?.fullName ?? "Application"}
        subtitle={open && d ? [d.primaryDiscipline, [d.city, d.country].filter(Boolean).join(", ")].filter(Boolean).join(" · ") : undefined}
        badges={open && <><StatusBadge status={open.status} />{open.submittedAt && <span className="text-xs text-white/55">Submitted {fmtTime(open.submittedAt)}</span>}</>}
        facts={open && d ? [
          { label: "Based in", value: [d.city, d.country].filter(Boolean).join(", ") || "—" },
          { label: "Years active", value: d.yearsActive ?? "—" },
          { label: "Credits", value: d.credits.length },
          { label: "Last update", value: open.history.length > 0 ? fmtTime(open.history[open.history.length - 1].at) : "—" },
        ] : undefined}
        footer={
          open && canDecide ? (
            <>
              <div>
                {open.status === "submitted" && (
                  <Button variant="ghost" onClick={() => { actions.markUnderReview(actor, open); toast.success("Moved to under review"); }}>
                    Start review
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setRejectOpen(true)}>Reject</Button>
                <Button onClick={() => setApproveOpen(true)}>Approve application</Button>
              </div>
            </>
          ) : undefined
        }
      >
        {open && d && (
          <>
            {open.decisionReason && (
              <DetailCallout tone="danger" label="Decision reason">{open.decisionReason}</DetailCallout>
            )}
            <DetailSection title="About">
              <p className="text-base font-semibold text-white">{d.primaryDiscipline}{d.yearsActive && <span className="font-normal text-white/60"> · {d.yearsActive}</span>}</p>
              <p className="mt-2 break-all text-sm text-white/65">{d.email}</p>
              <p className="mt-3 whitespace-pre-line text-[0.9375rem] leading-relaxed text-white/80">{d.biography}</p>
              {d.creativeBackground && <p className="mt-4 text-sm text-white/70"><span className="font-semibold text-white">Background. </span>{d.creativeBackground}</p>}
              {d.creativePhilosophy && <blockquote className="mt-5 border-l-2 border-white/30 pl-4 text-[0.9375rem] italic text-white/85">“{d.creativePhilosophy}”</blockquote>}
            </DetailSection>
            <DetailSection title={`Credits (${d.credits.length})`}>
              <DetailRows rows={d.credits.map((c) => ({
                primary: c.title,
                secondary: [c.role, c.format].filter(Boolean).join(", "),
                end: c.year,
              }))} />
            </DetailSection>
            {(d.portfolioUrl || d.links.length > 0) && (
              <DetailSection title="Portfolio and links">
                <ul className="space-y-2.5 text-sm">
                  {d.portfolioUrl && <li><a className="text-gold underline underline-offset-4 hover:text-white" href={d.portfolioUrl} target="_blank" rel="noopener noreferrer">{d.portfolioUrl}</a></li>}
                  {d.links.map((l) => <li key={l.url}><span className="text-white/55">{l.label}  </span><a className="text-gold underline underline-offset-4 hover:text-white" href={l.url} target="_blank" rel="noopener noreferrer">{l.url}</a></li>)}
                </ul>
              </DetailSection>
            )}
            <DetailSection title="Timeline">
              <DetailTimeline items={open.history.map((h, i, all) => ({
                label: h.status.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()),
                at: fmtTime(h.at),
                note: h.note,
                current: i === all.length - 1,
              }))} />
            </DetailSection>
          </>
        )}
      </DetailSheet>

      {open && (
        <>
          <ConfirmDialog
            open={approveOpen}
            onOpenChange={setApproveOpen}
            title={`Approve ${d?.fullName}?`}
            description="This creates their public filmmaker profile and grants the filmmaker role. They'll be able to manage their profile (changes still need approval)."
            confirmLabel="Approve application"
            onConfirm={() => { actions.approve(actor, open); toast.success(`${d?.fullName} approved. Filmmaker profile created.`); }}
          />
          <ReasonDialog
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            title={`Reject ${d?.fullName}'s application?`}
            description="The applicant will see your reason and can apply again."
            label="Reason for the applicant"
            confirmLabel="Reject application"
            destructive
            onConfirm={(reason) => { actions.reject(actor, open, reason); toast.success("Application rejected. The applicant can see your reason."); }}
          />
        </>
      )}
    </div>
  );
}
