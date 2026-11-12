import type { Metadata } from "next";
import { Suspense } from "react";
import { getDiscussions, getMembers } from "@/data/repositories/discussions";
import { MembersAdmin } from "@/features/admin/members-admin";
import { AdminSkeleton } from "@/features/admin/ui";

// Role-gated on the client (simulated), so children aren't rendered for ineligible users.
export const instant = false;

export const metadata: Metadata = { title: "Members" };

export default async function Page() {
  const [members, discussions] = await Promise.all([getMembers(), getDiscussions()]);
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <MembersAdmin members={members} discussions={discussions} />
    </Suspense>
  );
}
