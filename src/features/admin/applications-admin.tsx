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
import { AdminPageHeader, AdminSkeleton, AdminTable, DetailSheet, FilterBar, FilterSelect, ReasonDialog, SearchBox, Td, Th, fmt, fmtTime, useAdminReady } from "./ui";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h3 className="type-eyebrow mb-2 font-sans text-white/75">{title}</h3>
      {children}
    </section>
  );
}

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
        title={d?.fullName ?? "Application"}
        description={open ? `${d?.primaryDiscipline} · ${d?.country}` : undefined}
        footer={
          open && canDecide ? (
            <>
              {open.status === "submitted" && (
                <Button variant="outline" onClick={() => { actions.markUnderReview(actor, open); toast.success("Moved to under review"); }}>
                  Start review
                </Button>
              )}
              <Button onClick={() => setApproveOpen(true)}>Approve</Button>
              <Button variant="destructive" onClick={() => setRejectOpen(true)}>Reject</Button>
            </>
          ) : undefined
        }
      >
        {open && d && (
          <>
            <div className="mb-6 flex items-center gap-3">
              <StatusBadge status={open.status} />
              {open.submittedAt && <span className="text-xs text-muted-foreground">Submitted {fmtTime(open.submittedAt)}</span>}
            </div>
            {open.decisionReason && (
              <blockquote className="mb-6 border-l-4 border-danger pl-4 text-sm">
                <p className="type-eyebrow mb-1 text-[#ee8585]">Decision reason</p>
                {open.decisionReason}
              </blockquote>
            )}
            <Section title="Applicant">
              <dl className="grid grid-cols-[7rem_1fr] gap-y-1.5 text-sm">
                <dt className="text-muted-foreground">Name</dt><dd>{d.fullName}</dd>
                <dt className="text-muted-foreground">Email</dt><dd className="break-all">{d.email}</dd>
                <dt className="text-muted-foreground">Based in</dt><dd>{[d.city, d.country].filter(Boolean).join(", ")}</dd>
              </dl>
            </Section>
            <Section title="Professional background">
              <p className="text-sm"><span className="font-semibold">{d.primaryDiscipline}</span>{d.yearsActive && <span className="text-muted-foreground"> · {d.yearsActive}</span>}</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-reading/85">{d.biography}</p>
              {d.creativeBackground && <p className="mt-3 text-sm text-reading/70"><span className="font-semibold text-foreground">Background: </span>{d.creativeBackground}</p>}
              {d.creativePhilosophy && <p className="mt-3 border-l-4 border-gold pl-3 text-sm italic">“{d.creativePhilosophy}”</p>}
            </Section>
            <Section title={`Credits (${d.credits.length})`}>
              <ul className="divide-y divide-border border-y border-border text-sm">
                {d.credits.map((c) => (
                  <li key={c.id} className="flex justify-between gap-4 py-2">
                    <span><span className="font-semibold">{c.title}</span> <span className="text-muted-foreground">· {c.role}{c.format ? `, ${c.format}` : ""}</span></span>
                    <span className="text-muted-foreground">{c.year}</span>
                  </li>
                ))}
              </ul>
            </Section>
            {(d.portfolioUrl || d.links.length > 0) && (
              <Section title="Portfolio and links">
                <ul className="space-y-1 text-sm">
                  {d.portfolioUrl && <li><a className="text-gold underline" href={d.portfolioUrl} target="_blank" rel="noopener noreferrer">{d.portfolioUrl}</a></li>}
                  {d.links.map((l) => <li key={l.url}><span className="text-muted-foreground">{l.label}: </span><a className="text-gold underline" href={l.url} target="_blank" rel="noopener noreferrer">{l.url}</a></li>)}
                </ul>
              </Section>
            )}
            <Section title="Timeline">
              <ol className="space-y-2 text-sm">
                {open.history.map((h) => (
                  <li key={`${h.status}-${h.at}`}><span className="font-semibold capitalize">{h.status.replace("_", " ")}</span> <span className="text-xs text-muted-foreground">{fmtTime(h.at)}</span>{h.note && <span className="block text-xs text-muted-foreground">{h.note}</span>}</li>
                ))}
              </ol>
            </Section>
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
