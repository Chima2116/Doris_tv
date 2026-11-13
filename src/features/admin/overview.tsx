"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useNow } from "@/components/shared/time-ago";
import { timeAgo } from "@/lib/format";
import type { Discussion, Filmmaker, FilmmakerApplication, Member, ModerationReport } from "@/data/types";
import { mergeApplications, useApplicationsState } from "@/features/applications/applications-store";
import { mergeDiscussions, mergeReports } from "@/features/community/community-data";
import { useCommunityState } from "@/features/community/community-store";
import { useFilmmakers } from "@/features/filmmakers/use-public-filmmakers";
import { mergeRevisions, useRevisionsState } from "@/features/filmmakers/revisions-store";
import { applyMemberPatch, useMemberStore } from "@/features/members/member-store";
import { mergeArticles, mergeWaitlist, useAuditState, useCmsState, useWaitlistState } from "./admin-stores";
import { AdminPageHeader, AdminSkeleton, PrototypeNote, StatCard, useAdminReady } from "./ui";

type Props = {
  members: Member[];
  applications: FilmmakerApplication[];
  filmmakers: Filmmaker[];
  discussions: Discussion[];
  reports: ModerationReport[];
};

function Panel({ title, action, children }: { title: string; action?: { label: string; href: string }; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="type-eyebrow font-sans text-white/75">{title}</h3>
        {action && (
          <Link href={action.href} className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-gold">
            {action.label} →
          </Link>
        )}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function AdminOverview({ members, applications, filmmakers, discussions, reports }: Props) {
  const { ready } = useAdminReady();
  const now = useNow();
  const appsState = useApplicationsState();
  const revState = useRevisionsState();
  const commState = useCommunityState();
  const memberState = useMemberStore();
  const cmsState = useCmsState();
  const wlState = useWaitlistState();
  const audit = useAuditState();
  const { published } = useFilmmakers(filmmakers, applications);

  if (!ready) return <AdminSkeleton />;

  const apps = mergeApplications(applications, appsState);
  const pendingApps = apps.filter((a) => a.status === "submitted" || a.status === "under_review");
  const revs = mergeRevisions(revState);
  const pendingRevs = revs.filter((r) => r.status === "pending");
  const allReports = mergeReports(reports, commState);
  const openReports = allReports.filter((r) => r.status === "open");
  const escalated = allReports.filter((r) => r.status === "escalated");
  const mem = members.map((m) => applyMemberPatch(m, memberState.patches));
  const suspended = mem.filter((m) => m.accountStatus === "suspended").length;
  const wl = mergeWaitlist(wlState);
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const wlWeek = wl.filter((e) => new Date(e.registeredAt).getTime() > weekAgo).length;
  const articles = mergeArticles(cmsState);
  const publishedArticles = articles.filter((a) => a.status === "published").length;
  const discs = mergeDiscussions(discussions, commState).filter((d) => d.status === "published");
  const nameOf = (id: string) => mem.find((m) => m.id === id)?.displayName ?? "A member";

  type Ev = { at: string; text: string; href: string };
  const events: Ev[] = [
    ...apps.flatMap((a) => a.history.filter((h) => h.status !== "draft").map((h) => ({ at: h.at, text: `${a.details.fullName}: application ${h.status.replace("_", " ")}`, href: "/admin/applications" }))),
    ...allReports.map((r) => ({ at: r.createdAt, text: `${nameOf(r.reporterId)} reported a ${r.target.type}`, href: "/admin/moderation" })),
    ...revs.map((r) => ({ at: r.submittedAt, text: `Profile revision submitted for review`, href: "/admin/filmmakers" })),
    ...wl.slice(0, 6).map((e) => ({ at: e.registeredAt, text: `${e.name ?? e.email} joined the waitlist`, href: "/admin/waitlist" })),
    ...audit.entries.map((e) => ({ at: e.at, text: `${e.actorName}: ${e.detail}`, href: "/admin" })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 9);

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="What needs attention across DORIS TV right now."
        actions={
          <>
            <Button asChild size="sm"><Link href="/admin/applications">Review applications</Link></Button>
            <Button asChild size="sm" variant="outline"><Link href="/admin/moderation">Moderation queue</Link></Button>
            <Button asChild size="sm" variant="outline"><Link href="/admin/journal?new=1">New article</Link></Button>
          </>
        }
      />
      <PrototypeNote>Prototype: figures come from demo data plus anything you change in this session.</PrototypeNote>

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Members" value={mem.length} hint={`${suspended} suspended`} href="/admin/members" />
        <StatCard label="Waitlist" value={wl.length} hint={`${wlWeek} in the last 7 days`} href="/admin/waitlist" />
        <StatCard label="Published stories" value={publishedArticles} hint={`${articles.length - publishedArticles} drafts or scheduled`} href="/admin/journal" />
        <StatCard label="Filmmakers" value={published.length} hint="Published profiles" href="/admin/filmmakers" />
        <StatCard label="Applications to review" value={pendingApps.length} tone={pendingApps.length ? "warn" : undefined} href="/admin/applications" />
        <StatCard label="Profile revisions" value={pendingRevs.length} hint="Awaiting approval" tone={pendingRevs.length ? "warn" : undefined} href="/admin/filmmakers" />
        <StatCard label="Open reports" value={openReports.length + escalated.length} hint={`${escalated.length} escalated`} tone={openReports.length + escalated.length ? "warn" : undefined} href="/admin/moderation" />
        <StatCard label="Discussions" value={discs.length} hint="Public threads" href="/admin/moderation" />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Pending filmmaker applications" action={{ label: "All applications", href: "/admin/applications" }}>
          {pendingApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications are waiting. Nice work.</p>
          ) : (
            <ul className="divide-y divide-border">
              {pendingApps.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 text-sm">
                    <span className="font-semibold">{a.details.fullName}</span>
                    <span className="text-muted-foreground"> · {a.details.primaryDiscipline}, {a.details.country}</span>
                  </span>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Moderation activity" action={{ label: "Open queue", href: "/admin/moderation" }}>
          {allReports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {allReports.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="font-semibold capitalize">{r.reason.replace("_", " ")}</span>
                    <span className="text-muted-foreground"> · {r.target.type} · {timeAgo(r.createdAt, now)}</span>
                  </span>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent activity">
          <ul className="divide-y divide-border">
            {events.map((e, i) => (
              <li key={`${e.at}-${i}`} className="py-2.5 text-sm">
                <Link href={e.href} className="hover:text-gold">{e.text}</Link>
                <span className="block text-xs text-muted-foreground">{timeAgo(e.at, now)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid content-start gap-6">
          <Panel title="Members" action={{ label: "Manage", href: "/admin/members" }}>
            <dl className="grid grid-cols-3 gap-4 text-sm">
              {[
                ["Active", mem.filter((m) => m.accountStatus === "active").length],
                ["Moderators", mem.filter((m) => m.roles.includes("moderator")).length],
                ["Suspended", suspended],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <dd className="font-display text-2xl font-black">{v}</dd>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Waitlist" action={{ label: "View all", href: "/admin/waitlist" }}>
            <dl className="grid grid-cols-3 gap-4 text-sm">
              {[
                ["Registered", wl.filter((e) => e.status === "registered").length],
                ["Linked", wl.filter((e) => e.status === "linked").length],
                ["Invited", wl.filter((e) => e.status === "invited").length],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <dd className="font-display text-2xl font-black">{v}</dd>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
