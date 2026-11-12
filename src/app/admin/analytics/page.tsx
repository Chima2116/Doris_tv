import type { Metadata } from "next";
import { getApplications } from "@/data/repositories/applications";
import { getDiscussions, getMembers } from "@/data/repositories/discussions";
import { getAllFilmmakers } from "@/data/repositories/filmmakers";
import { AnalyticsAdmin } from "@/features/admin/analytics-admin";

// Role-gated on the client (simulated), so children aren't rendered for ineligible users.
export const instant = false;

export const metadata: Metadata = { title: "Analytics" };

export default async function Page() {
  const [members, applications, filmmakers, discussions] = await Promise.all([getMembers(), getApplications(), getAllFilmmakers(), getDiscussions()]);
  return <AnalyticsAdmin members={members} applications={applications} filmmakers={filmmakers} discussions={discussions} />;
}
