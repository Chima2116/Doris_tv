"use client";

import { useSyncExternalStore } from "react";

/** False on the server and during hydration, true afterwards. Gates UI that depends on persisted client state. */
export const useHydrated = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
