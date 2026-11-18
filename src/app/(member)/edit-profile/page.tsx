import type { Metadata } from "next";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { BackToProfile, ProfileForm } from "@/features/members/settings-forms";

// Role-gated on the client (simulated), so children aren't rendered for guests.
export const instant = false;

export const metadata: Metadata = { title: "Edit profile" };

export default function EditProfilePage() {
  return (
    <PageContainer width="narrow" className="py-12 sm:py-16">
      <BackToProfile />
      <header className="mb-10 mt-8">
        <Eyebrow>Your profile</Eyebrow>
        <h1 className="type-display-lg mt-3">Edit profile</h1>
      </header>
      <ProfileForm />
    </PageContainer>
  );
}
