"use client";

import { createPersistedStore, makeId } from "@/lib/persisted-store";
import { APPLICATIONS } from "@/data/mock/applications";
import type { ApplicationDetails, ApplicationStatus, FilmmakerApplication } from "@/data/types";

type State = {
  created: FilmmakerApplication[];
  patches: Record<string, Partial<FilmmakerApplication>>;
};

const { store, useStore } = createPersistedStore<State>("doris.applications", { created: [], patches: {} });
export const useApplicationsState = useStore;

const nowIso = () => new Date().toISOString();

const STATUS_NOTES: Partial<Record<ApplicationStatus, string>> = {
  submitted: "Your application has been received.",
  under_review: "A reviewer is looking at your credits and portfolio.",
  approved: "Approved. Welcome to the DORIS TV filmmaker directory.",
};

export const applicationsStore = {
  ...store,

  /** Create or update the applicant's draft. Returns the draft id. */
  saveDraft(applicantId: string, details: ApplicationDetails, existingId?: string): string {
    if (existingId) {
      store.update((s) => ({ ...s, patches: { ...s.patches, [existingId]: { ...s.patches[existingId], details } } }));
      return existingId;
    }
    const id = makeId("app");
    const app: FilmmakerApplication = {
      id,
      applicantId,
      createdAt: nowIso(),
      status: "draft",
      details,
      history: [{ status: "draft", at: nowIso() }],
    };
    store.update((s) => ({ ...s, created: [...s.created, app] }));
    return id;
  },

  /**
   * Move an application to a new status, appending to its timeline. Used by the
   * applicant's submit action, the dev-only demo panel and (Phase 5) admin review.
   * `app` must be the current merged application so existing history is preserved.
   */
  setStatus(app: FilmmakerApplication, status: ApplicationStatus, opts: { reason?: string; note?: string } = {}) {
    const at = nowIso();
    const decided = status === "approved" || status === "rejected";
    const patch: Partial<FilmmakerApplication> = {
      status,
      history: [...app.history, { status, at, note: opts.note ?? opts.reason ?? STATUS_NOTES[status] }],
      ...(status === "submitted" ? { submittedAt: at } : {}),
      ...(decided ? { decidedAt: at, decisionReason: opts.reason } : {}),
    };
    store.update((s) => ({ ...s, patches: { ...s.patches, [app.id]: { ...s.patches[app.id], ...patch } } }));
  },

  /** Start a fresh application (after rejection). Older applications are kept as history. */
  startNew(applicantId: string, prefill?: ApplicationDetails): string {
    return applicationsStore.saveDraft(applicantId, prefill ?? emptyDetails());
  },
};

export const emptyDetails = (): ApplicationDetails => ({
  fullName: "",
  email: "",
  country: "",
  primaryDiscipline: "",
  biography: "",
  links: [],
  credits: [],
});

export function mergeApplications(seed: FilmmakerApplication[], s: State): FilmmakerApplication[] {
  return [...seed, ...s.created].map((a) => ({ ...a, ...s.patches[a.id] }));
}

/** All of a person's applications, newest first. */
export function applicationsFor(applicantId: string, all: FilmmakerApplication[]) {
  return all.filter((a) => a.applicantId === applicantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * An approved application makes the applicant a verified filmmaker (roles are additive).
 * Returns the application that grants the role, if any.
 */
export function approvedApplicationFor(applicantId: string, s: State) {
  return mergeApplications(APPLICATIONS, s).find((a) => a.applicantId === applicantId && a.status === "approved");
}

/** Stable id for the filmmaker profile created by an approved application. */
export const filmmakerIdForApplication = (appId: string) => `f_${appId}`;
