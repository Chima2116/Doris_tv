"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session-provider";
import { applicationsFor, mergeApplications, useApplicationsState } from "@/features/applications/applications-store";
import { getMyLatestApplicationStatus } from "@/features/applications/remote-applications";
import { APPLICATIONS } from "@/data/mock/applications";
import type { ApplicationStatus } from "@/data/types";
import { canApplyAsFilmmaker, isVerifiedFilmmaker } from "@/lib/permissions";
import { cn } from "@/lib/utils";

/**
 * The one place a member is invited to become a filmmaker, on their own profile. The status comes
 * from Supabase, so it matches what the applicant and the admin see, with the browser copy as a fallback.
 */
export function FilmmakerCallout({ className }: { className?: string }) {
  const { user } = useSession();
  const appState = useApplicationsState();
  const [remoteStatus, setRemoteStatus] = useState<ApplicationStatus | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    getMyLatestApplicationStatus().then(setRemoteStatus);
  }, [userId]);

  if (!user || isVerifiedFilmmaker(user) || !canApplyAsFilmmaker(user)) return null;

  const mine = applicationsFor(user.id, mergeApplications(APPLICATIONS, appState));
  const status = remoteStatus ?? mine[0]?.status;
  const underReview = status === "submitted" || status === "under_review";
  const rejected = status === "rejected";

  const copy = underReview
    ? { label: "Filmmaker profile", title: "Your application is under review", body: "We'll let you know when the team has decided.", action: "View status", href: "/filmmaker-application/status" }
    : rejected
      ? { label: "Filmmaker profile", title: "Ready to try again?", body: "Your last application wasn't approved. You can apply again with an updated portfolio.", action: "Apply again", href: "/filmmaker-application" }
      : { label: "Filmmaker profile", title: "Make films? Join the directory", body: "Applications are reviewed by the DORIS TV team before a profile is listed.", action: "Apply", href: "/filmmaker-application" };

  return (
    <section
      aria-labelledby="filmmaker-invite"
      className={cn("flex flex-col gap-5 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between", className)}
    >
      <div className="min-w-0">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{copy.label}</p>
        <h2 id="filmmaker-invite" className="mt-2 font-display text-xl font-black tracking-[-0.01em]">
          {copy.title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{copy.body}</p>
      </div>
      <Button asChild variant="outline" className="shrink-0">
        <Link href={copy.href}>{copy.action}</Link>
      </Button>
    </section>
  );
}
