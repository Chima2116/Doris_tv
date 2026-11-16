import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "./ui";

/**
 * Journal stories are written and published in the Sanity Studio, which is the single source of
 * truth for the Journal. This page points editors there rather than offering a second editor.
 */
export function JournalAdmin() {
  return (
    <div>
      <AdminPageHeader
        title="Journal"
        description="Stories are written and published in the Studio."
        actions={
          <>
            <Button asChild size="sm"><Link href="/studio/structure/journalStory">Open the Studio</Link></Button>
            <Button asChild size="sm" variant="outline"><Link href="/journal">View the Journal</Link></Button>
          </>
        }
      />
      <section className="border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-black">Where to edit stories</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Create, edit and publish stories in the Studio under <span className="text-reading">Journal story</span>.</li>
          <li>Set a story to <span className="text-reading">Published</span> and it appears on the Journal within about a minute.</li>
          <li>Tick <span className="text-reading">Feature on the Journal front page</span> to make a story the cover story.</li>
        </ul>
      </section>
    </div>
  );
}
