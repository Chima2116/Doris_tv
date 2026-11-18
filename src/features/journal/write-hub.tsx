"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { TimeAgo } from "@/components/shared/time-ago";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session-provider";
import { useHydrated } from "@/lib/use-hydrated";
import { isVerifiedFilmmaker } from "@/lib/permissions";
import { deleteDraft, loadDrafts, type StoryDraft } from "./drafts";

const sectionLabel = "text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground";

/** A filmmaker's stories: the header, unfinished drafts, then everything they have sent. */
export function WriteHub() {
  const { user } = useSession();
  const hydrated = useHydrated();
  const [version, setVersion] = useState(0);
  const drafts: StoryDraft[] = useMemo(() => (hydrated ? loadDrafts() : []), [hydrated, version]);

  if (!user || !isVerifiedFilmmaker(user)) {
    return (
      <EmptyState
        title="This area is for verified filmmakers"
        description="Apply for a filmmaker profile, and once it's approved you can write for the Journal here."
        action={{ label: "Apply for a profile", href: "/filmmaker-application" }}
      />
    );
  }

  // Sent stories are not stored yet, so this list stays empty until sign-in and the Studio connection exist.
  const sent: { id: string; title: string; type: string; status: "submitted" | "under_review" | "approved" | "rejected" }[] = [];

  return (
    <section className="py-14 sm:py-20">
      <header className="flex flex-col gap-6 border-b border-border pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={sectionLabel}>Your stories</p>
          <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-black leading-[1.02] tracking-[-0.02em]">My journals</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Unfinished drafts, and every story you have sent to the Journal.</p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href="/write/new">Write a new journal</Link>
        </Button>
      </header>

      {drafts.length > 0 && (
        <section aria-labelledby="drafts-heading" className="pt-10">
          <div className="flex items-baseline justify-between">
            <h2 id="drafts-heading" className={sectionLabel}>Drafts</h2>
            <span className="text-sm text-muted-foreground">{drafts.length}</span>
          </div>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {drafts.map((d) => (
              <li key={d.id} className="grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold">{d.title || "Untitled draft"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {d.type || "No type yet"} · Saved <TimeAgo iso={d.updatedAt} />
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <Link href={`/write/new?draft=${d.id}`} className="group inline-flex items-center gap-1.5 font-semibold text-gold underline-offset-4 hover:underline">
                    Continue <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    className="text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-reading hover:underline"
                    onClick={() => {
                      if (!window.confirm("Delete this draft? This can't be undone.")) return;
                      deleteDraft(d.id);
                      setVersion((v) => v + 1);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="sent-heading" className="pt-12">
        <div className="flex items-baseline justify-between">
          <h2 id="sent-heading" className={sectionLabel}>Sent to the Journal</h2>
          <span className="text-sm text-muted-foreground">{sent.length}</span>
        </div>
        {sent.length === 0 ? (
          <div className="mt-6 border border-dashed border-border px-6 py-12 text-center sm:px-12">
            <p className="font-display text-xl font-bold">No stories sent yet</p>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Start with an interview, an essay, production notes or a retrospective. Our editors review each story before it goes live.
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {sent.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-6">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.type}</p>
                </div>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
