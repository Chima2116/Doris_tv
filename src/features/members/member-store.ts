"use client";

import { createPersistedStore } from "@/lib/persisted-store";
import type { Member, PrivacySettings, ProfileSection } from "@/data/types";

/** Editable profile fields, privacy and notification preferences, layered over the seed members. */
export type MemberPatch = Partial<Pick<Member, "displayName" | "bio" | "location" | "profileVisibility" | "privacy" | "accountStatus" | "roles" | "suspension">>;
export type Preferences = { notifyReplies: boolean; notifyNews: boolean };

type State = {
  patches: Record<string, MemberPatch>;
  prefs: Record<string, Preferences>;
};

export const DEFAULT_PREFS: Preferences = { notifyReplies: true, notifyNews: false };

const { store, useStore } = createPersistedStore<State>("doris.members", { patches: {}, prefs: {} });

export const memberStore = {
  ...store,
  patch(id: string, patch: MemberPatch) {
    store.update((s) => ({ ...s, patches: { ...s.patches, [id]: { ...s.patches[id], ...patch } } }));
  },
  setPrefs(id: string, prefs: Preferences) {
    store.update((s) => ({ ...s, prefs: { ...s.prefs, [id]: prefs } }));
  },
};
export const useMemberStore = useStore;

export function applyMemberPatch(member: Member, patches: State["patches"]): Member {
  return { ...member, ...patches[member.id] };
}

/**
 * Privacy resolution. Private profiles stay discoverable (identity is always visible);
 * privacy only controls optional sections. Public hides only sections the member turned off.
 * Private hides every optional section from other people.
 */
export const SECTIONS: { key: ProfileSection; label: string; hint: string }[] = [
  { key: "bio", label: "Biography", hint: "The short bio on your profile." },
  { key: "location", label: "Location", hint: "Your city or country." },
  { key: "activity", label: "Community activity", hint: "Your discussions and replies." },
  { key: "following", label: "Following", hint: "Filmmakers and members you follow." },
  { key: "saved", label: "Saved reading", hint: "Journal stories you've saved." },
];

export function isSectionVisible(member: Member, section: ProfileSection, viewerIsOwner: boolean) {
  if (viewerIsOwner) return true;
  if (member.profileVisibility === "private") return false;
  return !member.privacy.hiddenSections.includes(section);
}

export const makePrivacy = (visibility: PrivacySettings["visibility"], hiddenSections: ProfileSection[]): PrivacySettings => ({
  visibility,
  hiddenSections,
});
