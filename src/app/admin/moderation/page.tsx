import type { Metadata } from "next";
import { getReports } from "@/data/repositories/admin";
import { getDiscussions, getMembers, getReplies } from "@/data/repositories/discussions";
import { ModerationAdmin } from "@/features/admin/moderation-admin";

// Role-gated on the client (simulated), so children aren't rendered for ineligible users.
export const instant = false;

export const metadata: Metadata = { title: "Moderation" };

export default async function Page() {
  const [reports, discussions, replies, members] = await Promise.all([getReports(), getDiscussions(), getReplies(), getMembers()]);
  return <ModerationAdmin reports={reports} discussions={discussions} replies={replies} members={members} />;
}
