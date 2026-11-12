"use client";

import { useSyncExternalStore } from "react";
import type { Discussion, ModerationReport, Reply } from "@/data/types";
import {
  EMPTY_COMMUNITY,
  type CommunityState,
  type DiscussionPatch,
  type ReplyPatch,
} from "./community-data";

/**
 * Simulated community database (frontend only), persisted to localStorage.
 * Real persistence, authorship checks and permissions belong to a future backend.
 */
const KEY = "doris.community";
const listeners = new Set<() => void>();
let state: CommunityState = EMPTY_COMMUNITY;
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY_COMMUNITY, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

function commit(next: CommunityState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

const uid = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const now = () => new Date().toISOString();

export const community = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  getSnapshot() {
    hydrate();
    return state;
  },
  getServerSnapshot() {
    return EMPTY_COMMUNITY;
  },

  createDiscussion(input: { authorId: string; title: string; body: string; category: string }) {
    hydrate();
    const d: Discussion = {
      id: uid("d"),
      ...input,
      createdAt: now(),
      status: "published",
      replyCount: 0,
      reactionCount: 0,
    };
    commit({ ...state, createdDiscussions: [d, ...state.createdDiscussions] });
    return d;
  },
  patchDiscussion(id: string, patch: DiscussionPatch) {
    hydrate();
    commit({ ...state, discussionPatches: { ...state.discussionPatches, [id]: { ...state.discussionPatches[id], ...patch } } });
  },
  editDiscussion(id: string, input: { title: string; body: string; category: string }) {
    community.patchDiscussion(id, { ...input, editedAt: now() });
  },
  /** Soft delete: hidden from the public feed along with its replies; nothing is destroyed. */
  softDeleteDiscussion(id: string) {
    community.patchDiscussion(id, { status: "deleted", deletedAt: now() });
  },

  createReply(input: { discussionId: string; authorId: string; body: string }) {
    hydrate();
    const r: Reply = { id: uid("r"), ...input, createdAt: now(), status: "published", reactionCount: 0 };
    commit({ ...state, createdReplies: [...state.createdReplies, r] });
    return r;
  },
  patchReply(id: string, patch: ReplyPatch) {
    hydrate();
    commit({ ...state, replyPatches: { ...state.replyPatches, [id]: { ...state.replyPatches[id], ...patch } } });
  },
  editReply(id: string, body: string) {
    community.patchReply(id, { body, editedAt: now() });
  },

  toggleReaction(userId: string, key: string) {
    hydrate();
    const list = state.reactions[userId] ?? [];
    commit({
      ...state,
      reactions: {
        ...state.reactions,
        [userId]: list.includes(key) ? list.filter((k) => k !== key) : [...list, key],
      },
    });
  },

  patchReport(id: string, patch: Partial<ModerationReport>) {
    hydrate();
    commit({ ...state, reportPatches: { ...state.reportPatches, [id]: { ...state.reportPatches[id], ...patch } } });
  },

  addReport(input: Pick<ModerationReport, "target" | "reporterId" | "reason" | "details">) {
    hydrate();
    const report: ModerationReport = { id: uid("rep"), ...input, status: "open", createdAt: now(), notes: [] };
    commit({ ...state, reports: [...state.reports, report] });
    return report;
  },
};

export function useCommunityState() {
  return useSyncExternalStore(community.subscribe, community.getSnapshot, community.getServerSnapshot);
}
