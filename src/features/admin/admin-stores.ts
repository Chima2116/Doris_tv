"use client";

import { createPersistedStore, makeId } from "@/lib/persisted-store";
import type { AuditEntry, JournalArticle } from "@/data/types";
import type { FilmmakerAdminPatch } from "@/features/filmmakers/filmmaker-overlay";

/* ───── Audit log: every admin/moderator action is recorded (PRD §8.3) ───── */
const audit = createPersistedStore<{ entries: AuditEntry[] }>("doris.audit", { entries: [] });
export const useAuditState = audit.useStore;
export const auditStore = {
  ...audit.store,
  log(actor: { id: string; displayName: string }, action: string, detail: string) {
    const entry: AuditEntry = { id: makeId("aud"), at: new Date().toISOString(), actorId: actor.id, actorName: actor.displayName, action, detail };
    audit.store.update((s) => ({ entries: [entry, ...s.entries].slice(0, 200) }));
  },
};

/* ───── Admin publication / verification of filmmaker profiles ───── */
const fm = createPersistedStore<{ patches: Record<string, FilmmakerAdminPatch> }>("doris.filmmaker-admin", { patches: {} });
export const useFilmmakerAdminState = fm.useStore;
export const filmmakerAdminStore = {
  ...fm.store,
  patch(id: string, patch: FilmmakerAdminPatch) {
    fm.store.update((s) => ({ patches: { ...s.patches, [id]: { ...s.patches[id], ...patch } } }));
  },
};

/* ───── Journal CMS (simulation: does not change the public Journal) ───── */
const cms = createPersistedStore<{ created: JournalArticle[]; patches: Record<string, Partial<JournalArticle>> }>("doris.cms", { created: [], patches: {} });
export const useCmsState = cms.useStore;
export const cmsStore = {
  ...cms.store,
  create(article: Omit<JournalArticle, "id">) {
    const a: JournalArticle = { id: makeId("art"), ...article };
    cms.store.update((s) => ({ ...s, created: [a, ...s.created] }));
    return a;
  },
  patch(id: string, patch: Partial<JournalArticle>) {
    cms.store.update((s) => ({ ...s, patches: { ...s.patches, [id]: { ...s.patches[id], ...patch } } }));
  },
};
export const mergeArticles = (s: { created: JournalArticle[]; patches: Record<string, Partial<JournalArticle>> }): JournalArticle[] =>
  [...s.created].map((a) => ({ ...a, ...s.patches[a.id] })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
