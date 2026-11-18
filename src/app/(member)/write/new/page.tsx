import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { WriteStoryForm } from "@/features/journal/write-story-form";

// Role-gated on the client, so the form is not shown to people who are not verified filmmakers.
export const instant = false;

export const metadata: Metadata = { title: "New story" };

export default async function WriteStoryPage(props: PageProps<"/write/new">) {
  const { draft } = await props.searchParams;
  const draftId = typeof draft === "string" ? draft : undefined;
  return (
    <PageContainer width="narrow" className="py-12 sm:py-16">
      <Link href="/write" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-gold">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to my journals
      </Link>
      <header className="mb-10 mt-8 max-w-2xl">
        <Eyebrow>Write for the Journal</Eyebrow>
        <h1 className="type-display-lg mt-3">{draftId ? "Continue your draft" : "New story"}</h1>
        <p className="mt-4 text-reading/65">
          Send an interview, essay, production notes, retrospective or video to our editors. Once it has been reviewed, it can be published on the Journal.
        </p>
      </header>
      <WriteStoryForm draftId={draftId} />
    </PageContainer>
  );
}
