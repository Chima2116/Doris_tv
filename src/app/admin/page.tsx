import type { Metadata } from "next";
import { getApplications } from "@/data/repositories/applications";
import { getReports } from "@/data/repositories/admin";
import { getDiscussions, getMembers } from "@/data/repositories/discussions";
import { getAllFilmmakers } from "@/data/repositories/filmmakers";
import { AdminOverview } from "@/features/admin/overview";

// Role-gated on the client (simulated), so children aren't rendered for ineligible users.
export const instant = false;

export const metadata: Metadata = { title: "Overview" };

export default async function AdminPage() {
  const [members, applications, filmmakers, discussions, reports] = await Promise.all([
    getMembers(),
    getApplications(),
    getAllFilmmakers(),
    getDiscussions(),
    getReports(),
  ]);
  return <AdminOverview members={members} applications={applications} filmmakers={filmmakers} discussions={discussions} reports={reports} />;
}
