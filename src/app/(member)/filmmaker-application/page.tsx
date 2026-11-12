import type { Metadata } from "next";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { getApplications } from "@/data/repositories/applications";
import { ApplicationWizard } from "@/features/applications/application-wizard";

// Role-gated on the client (simulated), so children aren't rendered for guests.
export const instant = false;

export const metadata: Metadata = { title: "Filmmaker application" };

export default async function FilmmakerApplicationPage() {
  const seed = await getApplications();
  return (
    <PageContainer width="narrow" className="py-12 sm:py-16">
      <header className="mb-10">
        <Eyebrow>Filmmaker profile</Eyebrow>
        <h1 className="type-display-lg mt-3">Apply for a profile</h1>
        <p className="mt-4 text-reading/65">
          Tell us about your work. Applications are reviewed by the DORIS TV team, and approved
          filmmakers get a public profile in the directory. It takes about ten minutes.
        </p>
      </header>
      <ApplicationWizard seed={seed} />
    </PageContainer>
  );
}
