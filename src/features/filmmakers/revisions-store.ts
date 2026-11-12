"use client";

import { REVISIONS } from "@/data/mock/revisions";
import { createPersistedStore, makeId } from "@/lib/persisted-store";
import type { FilmmakerProfileFields, ProfileRevision, RevisionStatus } from "@/data/types";

/**
 * Proposed profile revisions. Saving a profile edit ONLY creates a pending revision;
 * the published profile never changes until an administrator approves it.
 */
type State = {
  created: ProfileRevision[];
  /** Decisions on any revision (seeded or created). */
  patches: Record<string, Partial<ProfileRevision>>;
};
const { store, useStore } = createPersistedStore<State>("doris.revisions.v2", { created: [], patches: {} });
export const useRevisionsState = useStore;

const nowIso = () => new Date().toISOString();

export const mergeRevisions = (s: State): ProfileRevision[] =>
  [...REVISIONS, ...s.created].map((r) => ({ ...r, ...s.patches[r.id] }));

export const revisionsStore = {
  ...store,

  /** One pending revision per filmmaker: saving again updates the pending proposal. */
  submit(filmmakerId: string, proposed: FilmmakerProfileFields) {
    store.update((s) => {
      const pending = mergeRevisions(s).find((r) => r.filmmakerId === filmmakerId && r.status === "pending");
      if (pending) {
        if (s.created.some((r) => r.id === pending.id)) {
          return { ...s, created: s.created.map((r) => (r.id === pending.id ? { ...r, proposed, submittedAt: nowIso() } : r)) };
        }
        return { ...s, patches: { ...s.patches, [pending.id]: { ...s.patches[pending.id], proposed, submittedAt: nowIso() } } };
      }
      const rev: ProfileRevision = { id: makeId("rev"), filmmakerId, proposed, status: "pending", submittedAt: nowIso() };
      return { ...s, created: [...s.created, rev] };
    });
  },

  withdraw(revisionId: string) {
    store.update((s) => ({
      ...s,
      created: s.created.filter((r) => r.id !== revisionId),
      patches: Object.fromEntries(Object.entries(s.patches).filter(([k]) => k !== revisionId)),
    }));
  },

  /** Administrator decision. Approval is what publishes a revision (see filmmaker-overlay). */
  decide(revisionId: string, status: Exclude<RevisionStatus, "pending">, reason?: string) {
    store.update((s) => ({
      ...s,
      patches: { ...s.patches, [revisionId]: { ...s.patches[revisionId], status, decidedAt: nowIso(), decisionReason: reason } },
    }));
  },
};

export const revisionsFor = (filmmakerId: string, all: ProfileRevision[]) =>
  all.filter((r) => r.filmmakerId === filmmakerId).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
