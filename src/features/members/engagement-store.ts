"use client";

import { useSyncExternalStore } from "react";

/**
 * Simulated per-user saved articles and follows, persisted to localStorage.
 * Follow targets are namespaced ids: "filmmaker:<slug>" or "member:<username>".
 */
type State = {
  saved: Record<string, string[]>; // userId -> article slugs
  following: Record<string, string[]>; // userId -> follow target ids
};

const KEY = "doris.engagement";
const EMPTY: State = { saved: {}, following: {} };
const listeners = new Set<() => void>();
let state: State = EMPTY;
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* ignore corrupted or unavailable storage */
  }
}

function commit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

const toggleIn = (list: string[] = [], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export const engagement = {
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
    return EMPTY;
  },
  toggleSaved(userId: string, slug: string) {
    hydrate();
    commit({ ...state, saved: { ...state.saved, [userId]: toggleIn(state.saved[userId], slug) } });
  },
  toggleFollow(userId: string, target: string) {
    hydrate();
    commit({
      ...state,
      following: { ...state.following, [userId]: toggleIn(state.following[userId], target) },
    });
  },
};

export function useEngagement() {
  return useSyncExternalStore(engagement.subscribe, engagement.getSnapshot, engagement.getServerSnapshot);
}
