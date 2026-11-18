"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/features/auth/session-provider";
import { applicationsFor, mergeApplications, useApplicationsState } from "@/features/applications/applications-store";
import { APPLICATIONS } from "@/data/mock/applications";
import { canApplyAsFilmmaker, isVerifiedFilmmaker } from "@/lib/permissions";
import { cn } from "@/lib/utils";

/**
 * The one place a member is invited to become a filmmaker: a quiet row on their own profile.
 * It is not shown across the member area. It reads the application state, so the wording is
 * "Apply", "Try again" or "Under review" as appropriate.
 */
export function FilmmakerCallout({ className }: { className?: string }) {
  const { user } = useSession();
  const appState = useApplicationsState();

  if (!user || isVerifiedFilmmaker(user) || !canApplyAsFilmmaker(user)) return null;

  const mine = applicationsFor(user.id, mergeApplications(APPLICATIONS, appState));
  const latest = mine[0];
  const underReview = latest && (latest.status === "submitted" || latest.status === "under_review");
  const rejected = latest?.status === "rejected";

  const copy = underReview
    ? { title: "Application under review", body: "We'll let you know when the team has decided.", action: "View status", href: "/filmmaker-application/status" }
    : rejected
      ? { title: "Filmmaker profile", body: "Your last application wasn't approved. You can apply again with an updated portfolio.", action: "Apply again", href: "/filmmaker-application" }
      : { title: "Filmmaker profile", body: "Make films? Apply to appear in the Filmmakers directory. Our team reviews every application.", action: "Apply", href: "/filmmaker-application" };

  return (
    <section aria-labelledby="filmmaker-invite" className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="min-w-0">
        <h2 id="filmmaker-invite" className="font-display text-2xl font-black tracking-[-0.01em]">{copy.title}</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">{copy.body}</p>
      </div>
      <Link
        href={copy.href}
        className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gold underline-offset-4 hover:underline"
      >
        {copy.action}
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </section>
  );
}
