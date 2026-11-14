"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Discussion, Filmmaker, FilmmakerApplication, Member } from "@/data/types";
import { mergeApplications, useApplicationsState } from "@/features/applications/applications-store";
import { mergeDiscussions, mergeReplies } from "@/features/community/community-data";
import { useCommunityState } from "@/features/community/community-store";
import { useFilmmakers } from "@/features/filmmakers/use-public-filmmakers";
import { mergeArticles, useCmsState } from "./admin-stores";
import { AdminPageHeader, AdminSkeleton, PrototypeNote, StatCard, useAdminReady } from "./ui";
import { REPLIES } from "@/data/mock/replies";

/* ───── Demonstration series (clearly labelled as demo data) ───── */
const WEEKS = ["Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26", "Nov 2", "Nov 9"];
const MEMBERS_CUM = [4, 11, 19, 27, 38, 52, 61, 74, 89, 104];
const SIGNUPS_WEEKLY = [6, 9, 12, 8, 15, 18, 14, 21, 26, 31];
const DISCUSSIONS_WEEKLY = [1, 2, 2, 3, 4, 3, 5, 6, 7, 9];
const TOP_STORIES = [
  ["Temi Adeyemi: “The story made itself political”", 2410],
  ["Who Gets to See African Films?", 1760],
  ["Against Resolution: The Unfinished Frame", 1385],
  ["Northern Voices: Five Films", 1120],
  ["Shooting in Badagry", 870],
  ["What Lagos Sounds Like", 760],
] as const;
const TOP_FILMMAKERS = [
  ["Temi Adeyemi", 980], ["Ngozi Ihejirika", 905], ["Wanjiru Kamau", 640], ["Esi Mensah-Boateng", 590], ["Moussa Ndiaye", 455],
] as const;

const INK = "var(--foreground)";
const MUTED = "var(--muted-foreground)";
const GRID = "var(--border)";
const SERIES = "var(--doris-gold)";

function ChartCard({ title, subtitle, table, children }: { title: string; subtitle: string; table: { head: string[]; rows: (string | number)[][] }; children: React.ReactNode }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <figure className="min-w-0 border border-border bg-surface p-5">
      <figcaption className="mb-4 flex items-start justify-between gap-3">
        <span>
          <span className="block font-display text-lg font-black">{title}</span>
          <span className="block text-xs text-muted-foreground">{subtitle}</span>
        </span>
        <Button size="xs" variant="ghost" aria-pressed={showTable} onClick={() => setShowTable((s) => !s)}>{showTable ? "View chart" : "View as table"}</Button>
      </figcaption>
      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{title}</caption>
            <thead><tr>{table.head.map((h) => <th key={h} scope="col" className="border-b border-border py-2 pr-4 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-border py-2 pr-4">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : children}
    </figure>
  );
}

/** One-axis line chart with a hover crosshair and tooltip. Single series, so no legend box. */
function LineChart({ labels, values, unit, ariaLabel }: { labels: string[]; values: number[]; unit: string; ariaLabel: string }) {
  const W = 560, H = 220, L = 36, R = 12, T = 12, B = 28;
  const max = Math.max(...values);
  const top = Math.ceil(max / 10) * 10 || 10;
  const x = (i: number) => L + (i * (W - L - R)) / (values.length - 1);
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const [hover, setHover] = useState<number | null>(null);
  const ticks = [0, top / 2, top];
  const path = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.min(values.length - 1, Math.max(0, Math.round(((px - L) / (W - L - R)) * (values.length - 1)))));
  };
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={MUTED}>{t}</text>
          </g>
        ))}
        {labels.map((l, i) => (i % 2 === 0 || i === labels.length - 1) && <text key={l} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill={MUTED}>{l}</text>)}
        <path d={path} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke={MUTED} strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(values[hover])} r={5} fill={SERIES} stroke="var(--card)" strokeWidth={2} />
          </>
        )}
        {hover === null && <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r={4} fill={SERIES} stroke="var(--card)" strokeWidth={2} />}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 border border-border bg-popover px-3 py-2 text-xs shadow-lg" style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > values.length / 2 ? "-105%" : "5%"})` }}>
          <p className="text-muted-foreground">Week of {labels[hover]}</p>
          <p className="font-semibold" style={{ color: INK }}>{values[hover]} {unit}</p>
        </div>
      )}
    </div>
  );
}

/** Horizontal bars: thin marks, 4px rounded data-end, value in ink beside the bar. */
function BarList({ rows, unit }: { rows: readonly (readonly [string, number])[]; unit: string }) {
  const max = Math.max(...rows.map((r) => r[1]));
  return (
    <ul className="space-y-3">
      {rows.map(([label, value]) => (
        <li key={label} title={`${label}: ${value.toLocaleString("en-GB")} ${unit}`}>
          <div className="mb-1 flex items-baseline justify-between gap-4 text-sm">
            <span className="min-w-0 truncate">{label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{value.toLocaleString("en-GB")}</span>
          </div>
          <div className="h-2 bg-border/60"><div className="h-2 rounded-r-[4px]" style={{ width: `${(value / max) * 100}%`, background: SERIES }} /></div>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsAdmin({ members, applications, filmmakers, discussions }: { members: Member[]; applications: FilmmakerApplication[]; filmmakers: Filmmaker[]; discussions: Discussion[] }) {
  const { ready } = useAdminReady();
  const appsState = useApplicationsState();
  const cms = useCmsState();
  const comm = useCommunityState();
  const { published } = useFilmmakers(filmmakers, applications);
  if (!ready) return <AdminSkeleton />;

  const apps = mergeApplications(applications, appsState).filter((a) => a.status !== "draft");
  const discs = mergeDiscussions(discussions, comm).filter((d) => d.status === "published");
  const reps = mergeReplies(REPLIES, comm).filter((r) => r.status === "published");
  const posters = new Set([...discs.map((d) => d.authorId), ...reps.map((r) => r.authorId)]);
  const participation = Math.round((posters.size / members.length) * 100);
  const publishedArticles = mergeArticles(cms).filter((a) => a.status === "published").length;

  const funnel = [
    ["Created an account", members.length],
    ["Verified email", members.filter((m) => m.emailVerified).length],
    ["Applied as a filmmaker", apps.length],
    ["Approved filmmakers", apps.filter((a) => a.status === "approved").length],
  ] as const;

  return (
    <div>
      <AdminPageHeader title="Analytics" description="How the platform is growing and being used." />
      <PrototypeNote>Demonstration data. Trend charts and read counts are illustrative; the tiles and funnel reflect the prototype&apos;s current state.</PrototypeNote>

      <section aria-label="Key figures" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Members" value={members.length} />
        <StatCard label="Accounts created" value={members.length} />
        <StatCard label="Published stories" value={publishedArticles} />
        <StatCard label="Filmmaker applications" value={apps.length} />
        <StatCard label="Approved filmmakers" value={published.length} hint="Published profiles" />
        <StatCard label="Discussions" value={discs.length} />
        <StatCard label="Replies" value={reps.length} />
        <StatCard label="Participation" value={`${participation}%`} hint="Members who have posted" />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Member growth" subtitle="Total members at the start of each week (demo data)" table={{ head: ["Week of", "Members"], rows: WEEKS.map((w, i) => [w, MEMBERS_CUM[i]]) }}>
          <LineChart labels={WEEKS} values={MEMBERS_CUM} unit="members" ariaLabel="Line chart: total members rising from 4 to 104 between 7 September and 9 November" />
        </ChartCard>
        <ChartCard title="Sign-ups per week" subtitle="New accounts each week (demo data)" table={{ head: ["Week of", "Sign-ups"], rows: WEEKS.map((w, i) => [w, SIGNUPS_WEEKLY[i]]) }}>
          <LineChart labels={WEEKS} values={SIGNUPS_WEEKLY} unit="sign-ups" ariaLabel="Line chart: weekly sign-ups rising from 6 to 31" />
        </ChartCard>
        <ChartCard title="New discussions per week" subtitle="Community threads started (demo data)" table={{ head: ["Week of", "Discussions"], rows: WEEKS.map((w, i) => [w, DISCUSSIONS_WEEKLY[i]]) }}>
          <LineChart labels={WEEKS} values={DISCUSSIONS_WEEKLY} unit="discussions" ariaLabel="Line chart: weekly new discussions rising from 1 to 9" />
        </ChartCard>
        <ChartCard title="From sign-up to approved filmmaker" subtitle="Current counts at each step" table={{ head: ["Step", "People"], rows: funnel.map((f) => [f[0], f[1]]) }}>
          <BarList rows={funnel} unit="people" />
        </ChartCard>
        <ChartCard title="Most-read stories" subtitle="Page views, last 30 days (demo data)" table={{ head: ["Story", "Views"], rows: TOP_STORIES.map((s) => [s[0], s[1]]) }}>
          <BarList rows={TOP_STORIES} unit="views" />
        </ChartCard>
        <ChartCard title="Most-visited filmmaker profiles" subtitle="Profile visits, last 30 days (demo data)" table={{ head: ["Filmmaker", "Visits"], rows: TOP_FILMMAKERS.map((s) => [s[0], s[1]]) }}>
          <BarList rows={TOP_FILMMAKERS} unit="visits" />
        </ChartCard>
      </div>
    </div>
  );
}
