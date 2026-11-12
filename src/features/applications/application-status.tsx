"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Eyebrow } from "@/components/shared/eyebrow";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import type { ApplicationStatus, FilmmakerApplication } from "@/data/types";
import { useSession } from "@/features/auth/session-provider";
import { applicationsFor, applicationsStore, mergeApplications, useApplicationsState } from "./applications-store";
import { cn } from "@/lib/utils";

const COPY: Record<ApplicationStatus, { title: string; body: string }> = {
  draft: { title: "Your application is a draft", body: "It hasn't been submitted yet. Pick up where you left off whenever you're ready." },
  submitted: { title: "Application received", body: "Our team has your application. It will move to review shortly. There's nothing you need to do." },
  under_review: { title: "Under review", body: "A reviewer is looking at your credits and portfolio. We'll update this page when there's a decision." },
  approved: { title: "Approved", body: "Welcome to the DORIS TV filmmaker directory. You can now manage your public profile." },
  rejected: { title: "Not approved this time", body: "You're welcome to apply again whenever you're ready. Your earlier application stays on record." },
};

const LABEL: Record<ApplicationStatus, string> = {
  draft: "Draft saved",
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

function Timeline({ app }: { app: FilmmakerApplication }) {
  const upcoming: ApplicationStatus[] =
    app.status === "approved" || app.status === "rejected" || app.status === "draft"
      ? []
      : app.status === "submitted"
        ? ["under_review"]
        : [];
  return (
    <ol className="relative ml-2 border-l border-border" aria-label="Application timeline">
      {app.history.map((e, i) => {
        const latest = i === app.history.length - 1;
        return (
          <li key={`${e.status}-${e.at}`} className="relative pb-8 pl-8 last:pb-0">
            <span
              aria-hidden="true"
              className={cn("absolute -left-[7px] top-1.5 size-3.5 border-2", latest ? "border-gold bg-gold" : "border-border bg-background")}
            />
            <p className="flex flex-wrap items-center gap-3">
              <span className={cn("font-semibold", latest && "text-gold")}>{LABEL[e.status]}</span>
              <time dateTime={e.at} className="text-xs text-muted-foreground">
                {formatDate(e.at)}
              </time>
            </p>
            {e.note && <p className="mt-1 max-w-xl text-sm text-muted-foreground">{e.note}</p>}
          </li>
        );
      })}
      {upcoming.map((s) => (
        <li key={s} className="relative pl-8 text-muted-foreground/60">
          <span aria-hidden="true" className="absolute -left-[7px] top-1.5 size-3.5 border-2 border-dashed border-border bg-background" />
          <p className="font-semibold">{LABEL[s]}</p>
          <p className="text-sm">Up next</p>
        </li>
      ))}
    </ol>
  );
}

/** Development-only: step through review states. Decisions are never made automatically. */
function DemoPanel({ app }: { app: FilmmakerApplication }) {
  if (process.env.NODE_ENV === "production") return null;
  const act = (status: ApplicationStatus, reason?: string) => {
    applicationsStore.setStatus(app, status, { reason });
    toast(`Demo: set status to ${LABEL[status]}`);
  };
  const canMove = app.status !== "draft";
  return (
    <aside className="mt-14 border border-dashed border-gold/50 p-5" aria-label="Demo controls">
      <Eyebrow>Development only</Eyebrow>
      <p className="mt-2 text-sm text-muted-foreground">
        Simulate an administrator&apos;s decision to preview each state. In the real product only admins
        decide, from the Applications screen in the admin area.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={!canMove} onClick={() => act("under_review")}>Mark under review</Button>
        <Button size="sm" variant="outline" disabled={!canMove} onClick={() => act("approved")}>Approve</Button>
        <Button size="sm" variant="outline" disabled={!canMove} onClick={() => act("rejected", "We need to see at least one completed professional credit with a public record before we can approve a profile.")}>Reject</Button>
      </div>
    </aside>
  );
}

export function ApplicationStatusView({ seed }: { seed: FilmmakerApplication[] }) {
  const { user } = useSession();
  const hydrated = useHydrated();
  const state = useApplicationsState();

  if (!hydrated) return <div className="h-72 animate-pulse bg-surface" aria-hidden="true" />;
  const mine = user ? applicationsFor(user.id, mergeApplications(seed, state)) : [];
  const [current, ...previous] = mine;

  if (!current) {
    return (
      <EmptyState
        icon={<ClipboardList />}
        title="You haven't applied yet"
        description="Apply for a verified filmmaker profile. You'll be able to follow your application here."
        action={{ label: "Start an application", href: "/filmmaker-application" }}
      />
    );
  }

  const copy = COPY[current.status];
  const d = current.details;

  return (
    <div>
      <section aria-labelledby="status-heading" className="border border-border bg-surface p-6 sm:p-8">
        <StatusBadge status={current.status} />
        <h2 id="status-heading" className="mt-4 font-display text-3xl font-black">{copy.title}</h2>
        <p className="mt-2 max-w-xl text-reading/75">{copy.body}</p>
        {current.status === "rejected" && current.decisionReason && (
          <blockquote className="mt-5 max-w-2xl border-l-4 border-danger pl-4 text-sm text-reading/85">
            <p className="type-eyebrow mb-1 text-[#ee8585]">Reviewer&apos;s note</p>
            {current.decisionReason}
          </blockquote>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {current.status === "draft" && <Button asChild><Link href="/filmmaker-application">Continue application</Link></Button>}
          {current.status === "rejected" && <Button asChild><Link href="/filmmaker-application">Start a new application</Link></Button>}
          {current.status === "approved" && <Button asChild><Link href="/filmmaker-dashboard/profile">Set up your profile</Link></Button>}
        </div>
      </section>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className="type-eyebrow mb-6 font-sans text-gold">Timeline</h2>
          <Timeline app={current} />
        </section>
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="type-eyebrow mb-6 font-sans text-gold">What you submitted</h2>
          <dl className="grid gap-4 text-sm">
            {[
              ["Name", d.fullName],
              ["Discipline", d.primaryDiscipline],
              ["Based in", [d.city, d.country].filter(Boolean).join(", ")],
              ["Active", d.yearsActive],
              ["Credits", `${d.credits.length}`],
            ].map(([k, v]) => v ? (
              <div key={k} className="flex justify-between gap-6 border-b border-border pb-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ) : null)}
          </dl>
        </section>
      </div>

      {previous.length > 0 && (
        <section aria-labelledby="prev-heading" className="mt-14">
          <h2 id="prev-heading" className="type-eyebrow mb-4 font-sans text-gold">Earlier applications</h2>
          <ul className="divide-y divide-border border-y border-border">
            {previous.map((a) => (
              <li key={a.id} className="py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={a.status} />
                  <span className="text-sm text-muted-foreground">
                    {a.submittedAt ? `Submitted ${formatDate(a.submittedAt)}` : `Started ${formatDate(a.createdAt)}`}
                  </span>
                </div>
                {a.decisionReason && <p className="mt-2 max-w-2xl text-sm text-reading/70">{a.decisionReason}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <DemoPanel app={current} />
    </div>
  );
}
