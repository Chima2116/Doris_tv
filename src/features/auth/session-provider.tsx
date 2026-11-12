"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import { type DemoIdentityKey, getDemoIdentity } from "@/data/mock/demo-users";
import type { Member } from "@/data/types";
import { checkGate, type GateAction, type GateResult, type CurrentUser } from "@/lib/permissions";
import {
  approvedApplicationFor,
  filmmakerIdForApplication,
  useApplicationsState,
} from "@/features/applications/applications-store";
import { applyMemberPatch, useMemberStore } from "@/features/members/member-store";
import { sessionStore } from "./session-store";

type PendingGate = {
  action: GateAction;
  result: Extract<GateResult, { allowed: false }>;
  run: (user: Member) => void;
  /** Where the visitor was when they hit the gate; they return here after signing in. */
  returnTo: string;
  open: boolean;
};

type SessionContextValue = {
  user: CurrentUser;
  identity: DemoIdentityKey;
  /** Switch the simulated identity (dev switcher or simulated sign-in). */
  switchIdentity: (key: DemoIdentityKey) => void;
  /**
   * Run a member-gated action. If the current user isn't eligible, a contextual
   * prompt opens and the intended action is remembered so it can complete after
   * simulated sign-in.
   */
  requestAction: (action: GateAction, run: (user: Member) => void) => void;
  pendingGate: PendingGate | null;
  /** Cancel the gated action entirely. */
  dismissGate: () => void;
  /** Close the prompt but remember the intended action (visitor is heading to sign in). */
  deferGate: () => void;
  /**
   * Simulated sign-in: switch identity, then complete the remembered action if now allowed.
   * Returns the path to send the visitor back to (or null).
   */
  signInAs: (key: DemoIdentityKey) => string | null;
};

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const identity = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot,
  );
  const [pendingGate, setPendingGate] = React.useState<PendingGate | null>(null);
  const { patches } = useMemberStore();
  const baseUser = getDemoIdentity(identity).member;
  const apps = useApplicationsState();
  let user = baseUser ? applyMemberPatch(baseUser, patches) : null;
  // Roles are additive: an approved filmmaker application grants the filmmaker role.
  if (user && !user.roles.includes("filmmaker")) {
    const approved = approvedApplicationFor(user.id, apps);
    if (approved) {
      user = { ...user, roles: [...user.roles, "filmmaker"], filmmakerId: filmmakerIdForApplication(approved.id) };
    }
  }

  const value = React.useMemo<SessionContextValue>(
    () => ({
      user,
      identity,
      switchIdentity: (key) => sessionStore.set(key),
      requestAction: (action, run) => {
        const result = checkGate(user, action);
        if (result.allowed) {
          if (user) run(user);
        } else {
          setPendingGate({
            action,
            result,
            run,
            returnTo: `${window.location.pathname}${window.location.search}`,
            open: true,
          });
        }
      },
      pendingGate,
      dismissGate: () => setPendingGate(null),
      deferGate: () => setPendingGate((g) => (g ? { ...g, open: false } : g)),
      signInAs: (key) => {
        sessionStore.set(key);
        if (!pendingGate) return null;
        const next = checkGate(getDemoIdentity(key).member, pendingGate.action);
        const { run, returnTo } = pendingGate;
        setPendingGate(null);
        const member = getDemoIdentity(key).member;
        if (next.allowed && member) run(member);
        return returnTo;
      },
    }),
    [user, identity, pendingGate],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
