import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { WriteHub } from "@/features/journal/write-hub";

// Role-gated on the client, so the list is not shown to people who are not verified filmmakers.
export const instant = false;

export const metadata: Metadata = { title: "Write for the Journal" };

export default function WritePage() {
  return (
    <PageContainer width="wide">
      <WriteHub />
    </PageContainer>
  );
}
