"use client";

import { useApplicationsState, mergeApplications } from "@/features/applications/applications-store";
import { useFilmmakerAdminState } from "@/features/admin/admin-stores";
import type { Filmmaker, FilmmakerApplication } from "@/data/types";
import { buildFilmmakers, publicFilmmakers } from "./filmmaker-overlay";
import { mergeRevisions, useRevisionsState } from "./revisions-store";

/** All filmmakers after approvals and admin patches, and the public (published) subset. */
export function useFilmmakers(seed: Filmmaker[], seedApplications: FilmmakerApplication[]) {
  const apps = useApplicationsState();
  const revs = useRevisionsState();
  const admin = useFilmmakerAdminState();
  const all = buildFilmmakers({
    seed,
    applications: mergeApplications(seedApplications, apps),
    revisions: mergeRevisions(revs),
    patches: admin.patches,
  });
  return { all, published: publicFilmmakers(all) };
}
