import type { Metadata } from "next";
import { getApplications } from "@/data/repositories/applications";
import { ApplicationsAdmin } from "@/features/admin/applications-admin";

// Role-gated on the client (simulated), so children aren't rendered for ineligible users.
export const instant = false;

export const metadata: Metadata = { title: "Applications" };

export default async function Page() {
  return <ApplicationsAdmin seed={await getApplications()} />;
}
