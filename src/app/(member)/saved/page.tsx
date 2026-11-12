import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { getArticles } from "@/data/repositories/articles";
import { SavedList } from "@/features/members/saved-list";

// Role-gated on the client (simulated), so children aren't rendered for guests.
export const instant = false;

export const metadata: Metadata = { title: "Saved reading" };

export default async function SavedPage() {
  const articles = await getArticles();
  return (
    <PageContainer width="wide" className="py-12 sm:py-16">
      <header className="mb-10">
        <Eyebrow>Your reading list</Eyebrow>
        <h1 className="type-display-lg mt-3">Saved reading</h1>
      </header>
      <SavedList articles={articles} />
    </PageContainer>
  );
}
