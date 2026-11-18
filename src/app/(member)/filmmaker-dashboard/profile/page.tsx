import type { Metadata } from "next";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { getApplications } from "@/data/repositories/applications";
import { getFilmmakers } from "@/data/repositories/filmmakers";
import { ProfileEditor } from "@/features/filmmakers/profile-editor";

// Role-gated on the client (simulated), so children aren't rendered for guests.
export const instant = false;

export const metadata: Metadata = { title: "Manage your filmmaker profile" };

export default async function FilmmakerDashboardPage() {
  const [filmmakers, applications] = await Promise.all([getFilmmakers(), getApplications()]);
  return (
    <PageContainer width="wide" className="py-12 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <Eyebrow>Filmmaker dashboard</Eyebrow>
        <h1 className="type-display-lg mt-3">Your public profile</h1>
        <p className="mt-4 text-reading/65">Edit how you appear in the directory. Every change is reviewed by an administrator before it goes live.</p>
        <p className="mt-6"><a href="/write" className="font-semibold text-gold underline underline-offset-4 hover:text-white">Write for the Journal &rarr;</a></p>
      </header>
      <ProfileEditor seedFilmmakers={filmmakers} seedApplications={applications} />
    </PageContainer>
  );
}
