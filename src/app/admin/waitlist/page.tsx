import type { Metadata } from "next";
import { getApplications } from "@/data/repositories/applications";
import { getMembers } from "@/data/repositories/discussions";
import { WaitlistAdmin } from "@/features/admin/waitlist-admin";

// Role-gated on the client (simulated), so children aren't rendered for ineligible users.
export const instant = false;

export const metadata: Metadata = { title: "Waitlist" };

export default async function Page() {
  const [members, applications] = await Promise.all([getMembers(), getApplications()]);
  return <WaitlistAdmin members={members} applications={applications} />;
}
