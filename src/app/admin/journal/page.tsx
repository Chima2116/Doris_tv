import type { Metadata } from "next";
import { Suspense } from "react";
import { JournalAdmin } from "@/features/admin/journal-admin";
import { AdminSkeleton } from "@/features/admin/ui";

// Role-gated on the client (simulated), so children aren't rendered for ineligible users.
export const instant = false;

export const metadata: Metadata = { title: "Journal" };

export default function Page() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <JournalAdmin />
    </Suspense>
  );
}
