"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { FilmmakerApplication, Member } from "@/data/types";
import { mergeApplications, useApplicationsState } from "@/features/applications/applications-store";
import { auditStore, mergeWaitlist, useWaitlistState, waitlistStore } from "./admin-stores";
import { AdminPageHeader, AdminSkeleton, AdminTable, FilterBar, FilterSelect, PrototypeNote, SearchBox, Td, Th, fmt, useAdminReady } from "./ui";

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

export function WaitlistAdmin({ members, applications }: { members: Member[]; applications: FilmmakerApplication[] }) {
  const { ready, actor } = useAdminReady();
  const wlState = useWaitlistState();
  const appsState = useApplicationsState();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [interest, setInterest] = useState("all");

  if (!ready || !actor) return <AdminSkeleton />;

  const apps = mergeApplications(applications, appsState);
  const rows = mergeWaitlist(wlState)
    .filter((e) => (status === "all" ? true : e.status === status))
    .filter((e) => (interest === "all" ? true : e.interest === interest))
    .filter((e) => !q.trim() || `${e.name ?? ""} ${e.email}`.toLowerCase().includes(q.trim().toLowerCase()));

  const exportCsv = () => {
    const head = "name,email,registered,status,interest";
    const body = rows.map((e) => [e.name ?? "", e.email, e.registeredAt, e.status, e.interest ?? ""].map(csvCell).join(","));
    const blob = new Blob([[head, ...body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "doris-tv-waitlist.csv";
    a.click();
    URL.revokeObjectURL(url);
    auditStore.log(actor, "waitlist.exported", `Exported ${rows.length} waitlist entries`);
    toast.success(`Exported ${rows.length} entries`);
  };

  return (
    <div>
      <AdminPageHeader
        title="Waitlist"
        description="Everyone who has joined the waitlist, and whether they've created an account or applied as a filmmaker."
        actions={<Button size="sm" variant="outline" onClick={exportCsv} disabled={rows.length === 0}><Download aria-hidden="true" /> Export CSV</Button>}
      />
      <PrototypeNote>Includes anyone who joins through the public waitlist form during this session.</PrototypeNote>
      <FilterBar>
        <SearchBox value={q} onChange={setQ} label="Search the waitlist" placeholder="Search name or email" />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, { value: "registered", label: "Registered" }, { value: "linked", label: "Linked to account" }, { value: "invited", label: "Invited" }]} />
        <FilterSelect label="Interest" value={interest} onChange={setInterest} options={[{ value: "all", label: "Any interest" }, { value: "reader", label: "Reader" }, { value: "filmmaker", label: "Filmmaker" }, { value: "writer", label: "Writer" }, { value: "other", label: "Other" }]} />
        <p className="ml-auto text-sm text-muted-foreground" role="status" aria-live="polite">{rows.length} {rows.length === 1 ? "entry" : "entries"}</p>
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No entries match" description="Try a different search or filter." action={{ label: "Clear filters", onClick: () => { setQ(""); setStatus("all"); setInterest("all"); } }} />
      ) : (
        <AdminTable caption="Waitlist entries" minWidth="min-w-[56rem]">
          <thead><tr><Th>Name</Th><Th>Email</Th><Th>Registered</Th><Th>Interest</Th><Th>Status</Th><Th>Account</Th><Th>Application</Th><Th className="text-right">Action</Th></tr></thead>
          <tbody>
            {rows.map((e) => {
              const m = e.memberId ? members.find((x) => x.id === e.memberId) : undefined;
              const app = e.memberId ? apps.filter((a) => a.applicantId === e.memberId && a.status !== "draft").sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] : undefined;
              return (
                <tr key={e.id} className="hover:bg-white/[0.02]">
                  <Td className="font-semibold">{e.name ?? "—"}</Td>
                  <Td className="text-muted-foreground">{e.email}</Td>
                  <Td className="whitespace-nowrap text-muted-foreground">{fmt(e.registeredAt)}</Td>
                  <Td className="capitalize">{e.interest ?? "—"}</Td>
                  <Td><StatusBadge status={e.status} /></Td>
                  <Td>{m ? `@${m.username}` : <span className="text-muted-foreground">No account</span>}</Td>
                  <Td>{app ? <StatusBadge status={app.status} /> : <span className="text-muted-foreground">None</span>}</Td>
                  <Td className="text-right">
                    {e.status === "registered" && (
                      <Button size="xs" variant="outline" onClick={() => { waitlistStore.patch(e.id, { status: "invited" }); auditStore.log(actor, "waitlist.invited", `${e.name ?? e.email} marked as invited`); toast.success(`${e.name ?? e.email} marked as invited (simulated)`); }}>
                        Mark invited
                      </Button>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
