import type { Metadata } from "next";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { getApplications } from "@/data/repositories/applications";
import { ApplicationStatusView } from "@/features/applications/application-status";

// Role-gated on the client (simulated), so children aren't rendered for guests.
export const instant = false;

export const metadata: Metadata = { title: "Application status" };

export default async function ApplicationStatusPage() {
  const seed = await getApplications();
  return (
    <PageContainer width="narrow" className="py-12 sm:py-16">
      <header className="mb-10">
        <Eyebrow>Filmmaker profile</Eyebrow>
        <h1 className="type-display-lg mt-3">Application status</h1>
      </header>
      <ApplicationStatusView seed={seed} />
    </PageContainer>
  );
}
