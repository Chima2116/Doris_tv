"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny persisted external store for simulated frontend state (localStorage-backed).
 * Server and hydration render with `empty`; the saved value applies after mount.
 * Real persistence and permission checks belong to a future backend.
 */
export function createPersistedStore<T>(key: string, empty: T) {
  const listeners = new Set<() => void>();
  let state = empty;
  let hydrated = false;

  const hydrate = () => {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = { ...empty, ...JSON.parse(raw) };
    } catch {
      /* ignore corrupted or unavailable storage */
    }
  };

  const store = {
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
      return empty;
    },
    update(updater: (s: T) => T) {
      hydrate();
      state = updater(state);
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        /* ignore */
      }
      listeners.forEach((l) => l());
    },
  };

  const useStore = () => useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { store, useStore };
}

export const makeId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
