"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import { EmptyState } from "@/components/shared/empty-state";
import { Eyebrow } from "@/components/shared/eyebrow";
import { TimeAgo } from "@/components/shared/time-ago";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session-provider";
import { isVerifiedFilmmaker } from "@/lib/permissions";
import { deleteDraft, loadDrafts, type StoryDraft } from "./drafts";

/** A filmmaker's stories: unfinished drafts first, then everything they have sent and where it stands. */
export function WriteHub() {
  const { user } = useSession();
  // Drafts live in this browser, so they are read only after the page has loaded in the browser.
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
  const sent: { id: string; title: string; type: string; status: string }[] = [];

  return (
    <section className="py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Your stories</Eyebrow>
          <h1 className="type-display-lg mt-3">My journals</h1>
          <p className="mt-3 text-reading/65">Your drafts, and everything you have sent to the Journal.</p>
        </div>
        <Button asChild variant="gold" size="lg">
          <Link href="/write/new">Write a new journal</Link>
        </Button>
      </div>

      {drafts.length > 0 && (
        <div className="mt-12">
          <h2 className="type-eyebrow text-gold">Drafts</h2>
          <ul className="mt-4 divide-y divide-white/15 border-y border-white/15">
            {drafts.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div className="min-w-0">
                  <p className="font-semibold text-reading">{d.title || "Untitled draft"}</p>
                  <p className="mt-1 text-sm text-reading/60">
                    {d.type || "No type yet"} · saved <TimeAgo iso={d.updatedAt} />
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <Link href={`/write/new?draft=${d.id}`} className="font-semibold text-gold underline underline-offset-4">
                    Continue
                  </Link>
                  <button
                    type="button"
                    className="text-reading/60 underline underline-offset-4 hover:text-reading"
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
        </div>
      )}

      <div className="mt-12">
        <h2 className="type-eyebrow text-gold">Sent to the Journal</h2>
        {sent.length === 0 ? (
          <div className="mt-4 border border-white/15 bg-surface p-8">
            <p className="text-lg font-semibold text-reading">You have not sent a story yet.</p>
            <p className="mt-2 max-w-xl text-reading/65">
              Start with an interview, an essay, production notes, a retrospective or a video. Our editors review each story before it goes live.
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-white/15 border-y border-white/15">
            {sent.map((s) => (
              <li key={s.id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8">
                <span className="font-semibold text-reading">{s.title}</span>
                <span className="text-sm text-reading/60">{s.type}</span>
                <span className="text-sm font-semibold text-gold">{s.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
