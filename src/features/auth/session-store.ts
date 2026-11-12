import { type DemoIdentityKey, getDemoIdentity } from "@/data/mock/demo-users";

/**
 * Tiny external store for the simulated current user, persisted to
 * localStorage so the demo identity survives reloads. Not real authentication.
 */
const STORAGE_KEY = "doris.demo-identity";
const listeners = new Set<() => void>();

let current: DemoIdentityKey = "guest";
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) current = getDemoIdentity(saved).key;
  } catch {
    /* storage unavailable: stay a guest */
  }
}

export const sessionStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  getSnapshot(): DemoIdentityKey {
    hydrate();
    return current;
  },
  getServerSnapshot(): DemoIdentityKey {
    return "guest";
  },
  set(key: DemoIdentityKey) {
    current = key;
    try {
      window.localStorage.setItem(STORAGE_KEY, key);
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  },
};
