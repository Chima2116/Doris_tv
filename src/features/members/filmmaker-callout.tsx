"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session-provider";
import { applicationsFor, mergeApplications, useApplicationsState } from "@/features/applications/applications-store";
import { APPLICATIONS } from "@/data/mock/applications";
import { canApplyAsFilmmaker, isVerifiedFilmmaker } from "@/lib/permissions";
import { cn } from "@/lib/utils";

/**
 * A visible, honest prompt for members who are not yet filmmakers. It reads the person's
 * application state, so it says "Apply", "Apply again" or "Under review" as appropriate.
 * Shown across the member area, not only inside the profile menu.
 */
export function FilmmakerCallout({ className }: { className?: string }) {
  const { user } = useSession();
  const appState = useApplicationsState();

  if (!user || isVerifiedFilmmaker(user) || !canApplyAsFilmmaker(user)) return null;

  const mine = applicationsFor(user.id, mergeApplications(APPLICATIONS, appState));
  const latest = mine[0];
  const underReview = latest && (latest.status === "submitted" || latest.status === "under_review");
  const rejected = latest?.status === "rejected";

  if (underReview) {
    return (
      <div className={cn("flex flex-col gap-4 border-b border-border bg-surface px-1 py-5 sm:flex-row sm:items-center sm:justify-between", className)}>
        <p className="flex items-center gap-3 text-sm text-reading/85">
          <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>
            <span className="font-semibold text-reading">Your filmmaker application is under review.</span>{" "}
            <span className="text-muted-foreground">We&apos;ll let you know when the team has decided.</span>
          </span>
        </p>
        <Link href="/filmmaker-application/status" className="inline-flex items-center gap-2 text-sm font-semibold text-reading underline decoration-white/40 underline-offset-4 transition-colors duration-200 hover:text-gold hover:decoration-gold">
          View status <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-5 border-b border-border bg-surface px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8", className)}>
      <div className="min-w-0">
        <p className="tag text-gold">For filmmakers</p>
        <p className="mt-2 font-display text-xl font-black leading-tight tracking-[-0.01em] text-reading sm:text-2xl">
          {rejected ? "Ready to try again?" : "Are you a filmmaker?"}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {rejected
            ? "You can apply again with an updated portfolio. Our team reviews every application."
            : "Apply for a verified profile. Our team reviews every application before it goes live."}
        </p>
      </div>
      <Button asChild className="shrink-0">
        <Link href="/filmmaker-application">
          {rejected ? "Apply again" : "Apply now"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
