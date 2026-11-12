import type { Metadata } from "next";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { SettingsForms } from "@/features/members/settings-forms";

// Role-gated on the client (simulated), so children aren't rendered for guests.
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PageContainer width="narrow" className="py-12 sm:py-16">
      <header className="mb-10">
        <Eyebrow>Your account</Eyebrow>
        <h1 className="type-display-lg mt-3">Settings</h1>
      </header>
      <SettingsForms />
    </PageContainer>
  );
}
