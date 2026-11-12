"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Filmmaker, FilmmakerApplication, FilmmakerProfileFields, ProfileRevision } from "@/data/types";
import { useFilmmakers } from "@/features/filmmakers/use-public-filmmakers";
import { mergeRevisions, revisionsFor, useRevisionsState } from "@/features/filmmakers/revisions-store";
import { filmmakers as actions } from "./admin-actions";
import { AdminPageHeader, AdminSkeleton, AdminTable, DetailSheet, FilterBar, FilterSelect, ReasonDialog, SearchBox, Td, Th, fmt, fmtTime, useAdminReady } from "./ui";

const toFields = (f: Filmmaker): FilmmakerProfileFields => ({
  name: f.name,
  country: f.country,
  location: f.location,
  primaryDiscipline: f.primaryDiscipline,
  biography: f.biography,
  creativePhilosophy: f.creativePhilosophy,
  yearsActive: f.yearsActive,
  credits: f.credits,
  links: f.links,
});

type Row = { label: string; before: string; after: string };
function diff(current: FilmmakerProfileFields, proposed: FilmmakerProfileFields) {
  const scalar: [string, keyof FilmmakerProfileFields][] = [
    ["Name", "name"], ["Country", "country"], ["City", "location"], ["Discipline", "primaryDiscipline"],
    ["Years active", "yearsActive"], ["Biography", "biography"], ["Creative philosophy", "creativePhilosophy"],
  ];
  const rows: Row[] = scalar
    .map(([label, k]) => ({ label, before: String(current[k] ?? ""), after: String(proposed[k] ?? "") }))
    .filter((r) => r.before !== r.after);
  const key = (c: { title: string }) => c.title.trim().toLowerCase();
  const added = proposed.credits.filter((c) => !current.credits.some((x) => key(x) === key(c)));
  const removed = current.credits.filter((c) => !proposed.credits.some((x) => key(x) === key(c)));
  const changed = proposed.credits.flatMap((c) => {
    const old = current.credits.find((x) => key(x) === key(c));
    return old && (old.year !== c.year || old.role !== c.role || old.format !== c.format || !!old.inProduction !== !!c.inProduction) ? [{ old, now: c }] : [];
  });
  const linkSig = (l: { label: string; url: string }[]) => l.map((x) => `${x.label}|${x.url}`).sort().join(",");
  const linksChanged = linkSig(current.links) !== linkSig(proposed.links);
  return { rows, added, removed, changed, linksChanged, none: rows.length + added.length + removed.length + changed.length === 0 && !linksChanged };
}

function Compare({ current, proposed }: { current: FilmmakerProfileFields; proposed: FilmmakerProfileFields }) {
  const d = diff(current, proposed);
  if (d.none) return <p className="text-sm text-muted-foreground">No differences from the published profile.</p>;
  return (
    <div className="space-y-6">
      {d.rows.map((r) => (
        <div key={r.label}>
          <h4 className="type-eyebrow mb-2 font-sans text-gold">{r.label}</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="border border-danger/40 bg-danger/5 p-3 text-sm"><p className="type-eyebrow mb-1 text-muted-foreground">Published</p><p className="whitespace-pre-line text-reading/80">{r.before || "—"}</p></div>
            <div className="border border-success/40 bg-success/5 p-3 text-sm"><p className="type-eyebrow mb-1 text-muted-foreground">Proposed</p><p className="whitespace-pre-line text-reading/90">{r.after || "—"}</p></div>
          </div>
        </div>
      ))}
      {(d.added.length > 0 || d.removed.length > 0 || d.changed.length > 0) && (
        <div>
          <h4 className="type-eyebrow mb-2 font-sans text-gold">Credits</h4>
          <ul className="divide-y divide-border border-y border-border text-sm">
            {d.added.map((c) => <li key={c.id} className="py-2 text-[#6fd09b]">+ Added: <strong>{c.title}</strong> ({c.year}, {c.role})</li>)}
            {d.removed.map((c) => <li key={c.id} className="py-2 text-[#ee8585]">− Removed: <strong>{c.title}</strong> ({c.year})</li>)}
            {d.changed.map(({ old, now }) => <li key={now.id} className="py-2 text-warning">~ Changed: <strong>{now.title}</strong> ({old.year}, {old.role} → {now.year}, {now.role}{now.inProduction && !old.inProduction ? ", in production" : ""})</li>)}
          </ul>
        </div>
      )}
      {d.linksChanged && (
        <div>
          <h4 className="type-eyebrow mb-2 font-sans text-gold">Links</h4>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <ul className="border border-danger/40 bg-danger/5 p-3">{current.links.map((l) => <li key={l.url}>{l.label}</li>)}</ul>
            <ul className="border border-success/40 bg-success/5 p-3">{proposed.links.map((l) => <li key={l.url}>{l.label}: <span className="break-all text-muted-foreground">{l.url}</span></li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function FilmmakersAdmin({ seed, seedApplications }: { seed: Filmmaker[]; seedApplications: FilmmakerApplication[] }) {
  const { ready, actor } = useAdminReady();
  const { all } = useFilmmakers(seed, seedApplications);
  const revState = useRevisionsState();
  const [q, setQ] = useState("");
  const [pub, setPub] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [revId, setRevId] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);

  if (!ready || !actor) return <AdminSkeleton />;

  const revs = mergeRevisions(revState);
  const pendingRevs = revs.filter((r) => r.status === "pending").sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const nameOf = (id: string) => all.find((f) => f.id === id)?.name ?? "Unknown filmmaker";
  const rows = all
    .filter((f) => (pub === "all" ? true : f.publicationStatus === pub))
    .filter((f) => !q.trim() || `${f.name} ${f.country} ${f.primaryDiscipline}`.toLowerCase().includes(q.trim().toLowerCase()));

  const open = all.find((f) => f.id === openId);
  const rev: ProfileRevision | undefined = revs.find((r) => r.id === revId);
  const revFm = rev ? all.find((f) => f.id === rev.filmmakerId) : undefined;

  return (
    <div>
      <AdminPageHeader title="Filmmakers" description="Manage published profiles and review every change filmmakers propose. Nothing a filmmaker edits goes public until you approve it." />
      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Revision queue ({pendingRevs.length})</TabsTrigger>
          <TabsTrigger value="all">All filmmakers ({all.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          {pendingRevs.length === 0 ? (
            <EmptyState title="No revisions waiting" description="When a filmmaker saves changes to their profile, they'll appear here for approval." />
          ) : (
            <AdminTable caption="Pending profile revisions">
              <thead><tr><Th>Filmmaker</Th><Th>Submitted</Th><Th>Status</Th><Th className="text-right">Action</Th></tr></thead>
              <tbody>
                {pendingRevs.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <Td className="font-semibold">{nameOf(r.filmmakerId)}</Td>
                    <Td className="text-muted-foreground">{fmtTime(r.submittedAt)}</Td>
                    <Td><StatusBadge status={r.status} /></Td>
                    <Td className="text-right"><Button size="xs" onClick={() => setRevId(r.id)}>Review changes</Button></Td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          )}
        </TabsContent>

        <TabsContent value="all">
          <FilterBar>
            <SearchBox value={q} onChange={setQ} label="Search filmmakers" placeholder="Search name, country, discipline" />
            <FilterSelect label="Publication" value={pub} onChange={setPub} options={[{ value: "all", label: "All" }, { value: "published", label: "Published" }, { value: "unpublished", label: "Unpublished" }]} />
          </FilterBar>
          {rows.length === 0 ? (
            <EmptyState title="No filmmakers match" description="Try a different search or filter." action={{ label: "Clear filters", onClick: () => { setQ(""); setPub("all"); } }} />
          ) : (
            <AdminTable caption="Filmmaker profiles">
              <thead><tr><Th>Name</Th><Th>Discipline</Th><Th>Country</Th><Th>Verification</Th><Th>Publication</Th><Th>Revisions</Th><Th className="text-right">Action</Th></tr></thead>
              <tbody>
                {rows.map((f) => {
                  const pend = revisionsFor(f.id, revs).filter((r) => r.status === "pending").length;
                  return (
                    <tr key={f.id} className="hover:bg-white/[0.02]">
                      <Td className="font-semibold">{f.name}</Td>
                      <Td>{f.primaryDiscipline}</Td>
                      <Td>{f.country}</Td>
                      <Td><StatusBadge status={f.verificationStatus} /></Td>
                      <Td><StatusBadge status={f.publicationStatus} /></Td>
                      <Td>{pend ? <StatusBadge status="pending" /> : <span className="text-muted-foreground">None</span>}</Td>
                      <Td className="text-right"><Button size="xs" variant="outline" onClick={() => setOpenId(f.id)}>Details</Button></Td>
                    </tr>
                  );
                })}
              </tbody>
            </AdminTable>
          )}
        </TabsContent>
      </Tabs>

      {/* Revision review */}
      <DetailSheet
        open={!!rev}
        onOpenChange={(o) => !o && setRevId(null)}
        title={revFm ? `Revision: ${revFm.name}` : "Revision"}
        description="Compare the published profile with the proposed changes."
        footer={rev?.status === "pending" ? (<><Button onClick={() => setApproveOpen(true)}>Approve and publish</Button><Button variant="destructive" onClick={() => setRejectOpen(true)}>Reject</Button></>) : undefined}
      >
        {rev && revFm && (
          <>
            <div className="mb-5 flex items-center gap-3"><StatusBadge status={rev.status} /><span className="text-xs text-muted-foreground">Submitted {fmtTime(rev.submittedAt)}</span></div>
            {rev.decisionReason && <blockquote className="mb-5 border-l-4 border-danger pl-4 text-sm"><p className="type-eyebrow mb-1 text-[#ee8585]">Decision reason</p>{rev.decisionReason}</blockquote>}
            <Compare current={toFields(revFm)} proposed={rev.proposed} />
          </>
        )}
      </DetailSheet>

      {/* Filmmaker details */}
      <DetailSheet
        open={!!open}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open?.name ?? "Filmmaker"}
        description={open ? `${open.primaryDiscipline} · ${open.country}` : undefined}
        footer={open ? (
          <>
            {open.publicationStatus === "published" ? (
              <Button variant="outline" onClick={() => setUnpublishOpen(true)}>Unpublish profile</Button>
            ) : (
              <Button onClick={() => { actions.setPublication(actor, open, "published"); toast.success(`${open.name} is published`); }}>Publish profile</Button>
            )}
            <Button variant="outline" onClick={() => { actions.setVerification(actor, open, open.verificationStatus !== "verified"); toast.success(open.verificationStatus === "verified" ? "Verification removed" : "Marked as verified"); }}>
              {open.verificationStatus === "verified" ? "Remove verification" : "Verify"}
            </Button>
            <Button asChild variant="ghost"><Link href={`/filmmakers/${open.slug}`} target="_blank">View public page</Link></Button>
          </>
        ) : undefined}
      >
        {open && (
          <>
            <div className="mb-5 flex gap-2"><StatusBadge status={open.verificationStatus} /><StatusBadge status={open.publicationStatus} /></div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-reading/85">{open.biography}</p>
            {open.creativePhilosophy && <p className="mt-4 border-l-4 border-gold pl-3 text-sm italic">“{open.creativePhilosophy}”</p>}
            <h4 className="type-eyebrow mb-2 mt-6 font-sans text-gold">Credits ({open.credits.length})</h4>
            <ul className="divide-y divide-border border-y border-border text-sm">
              {open.credits.map((c) => <li key={c.id} className="flex justify-between gap-4 py-2"><span><strong>{c.title}</strong> <span className="text-muted-foreground">· {c.role}</span></span><span className="text-muted-foreground">{c.year}</span></li>)}
            </ul>
            <h4 className="type-eyebrow mb-2 mt-6 font-sans text-gold">Revision history</h4>
            {revisionsFor(open.id, revs).length === 0 ? <p className="text-sm text-muted-foreground">No revisions yet.</p> : (
              <ul className="space-y-2 text-sm">
                {revisionsFor(open.id, revs).map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-2"><StatusBadge status={r.status} /><span className="text-xs text-muted-foreground">{fmt(r.submittedAt)}</span>{r.decisionReason && <span className="text-xs text-muted-foreground">· {r.decisionReason}</span>}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </DetailSheet>

      {rev && revFm && (
        <>
          <ConfirmDialog
            open={approveOpen}
            onOpenChange={setApproveOpen}
            title={`Approve changes to ${revFm.name}?`}
            description="The proposed changes will replace the published profile and become visible to everyone."
            confirmLabel="Approve and publish"
            onConfirm={() => { actions.approveRevision(actor, rev, revFm.name); toast.success("Revision approved and published"); setRevId(null); }}
          />
          <ReasonDialog
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            title={`Reject changes to ${revFm.name}?`}
            description="The published profile stays exactly as it is. The filmmaker will see your reason."
            label="Reason for the filmmaker"
            confirmLabel="Reject revision"
            destructive
            onConfirm={(reason) => { actions.rejectRevision(actor, rev, revFm.name, reason); toast.success("Revision rejected. The published profile is unchanged."); setRevId(null); }}
          />
        </>
      )}
      {open && (
        <ConfirmDialog
          open={unpublishOpen}
          onOpenChange={setUnpublishOpen}
          title={`Unpublish ${open.name}?`}
          description="Their profile disappears from the directory and their page. You can publish it again at any time."
          confirmLabel="Unpublish"
          destructive
          onConfirm={() => { actions.setPublication(actor, open, "unpublished"); toast.success(`${open.name} unpublished`); }}
        />
      )}
    </div>
  );
}
