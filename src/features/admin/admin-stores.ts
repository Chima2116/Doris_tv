"use client";

import { ARTICLES } from "@/data/mock/articles";
import { WAITLIST } from "@/data/mock/waitlist";
import { createPersistedStore, makeId } from "@/lib/persisted-store";
import type { AuditEntry, JournalArticle, WaitlistEntry } from "@/data/types";
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

/* ───── Waitlist: seeded entries plus any submitted through the public form ───── */
const wl = createPersistedStore<{ created: WaitlistEntry[]; patches: Record<string, Partial<WaitlistEntry>> }>("doris.waitlist", { created: [], patches: {} });
export const useWaitlistState = wl.useStore;
export const waitlistStore = {
  ...wl.store,
  add(entry: Pick<WaitlistEntry, "name" | "email" | "interest">) {
    const e: WaitlistEntry = { id: makeId("w"), ...entry, registeredAt: new Date().toISOString(), status: "registered" };
    wl.store.update((s) => ({ ...s, created: [e, ...s.created] }));
  },
  patch(id: string, patch: Partial<WaitlistEntry>) {
    wl.store.update((s) => ({ ...s, patches: { ...s.patches, [id]: { ...s.patches[id], ...patch } } }));
  },
};
export const mergeWaitlist = (s: { created: WaitlistEntry[]; patches: Record<string, Partial<WaitlistEntry>> }) =>
  [...s.created, ...WAITLIST].map((e) => ({ ...e, ...s.patches[e.id] })).sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));

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
  [...s.created, ...ARTICLES].map((a) => ({ ...a, ...s.patches[a.id] })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
