/**
 * Journal drafts. A filmmaker's unfinished story is saved as they type, so leaving the page never
 * loses work. Drafts are kept in this browser for now; once sign-in and the Studio connection exist
 * they move to the server with the rest of the submission.
 */

export type StoryDraft = {
  id: string;
  title: string;
  type: string;
  excerpt: string;
  body: string;
  videoUrl: string;
  coverCredit: string;
  updatedAt: string; // ISO time of the last autosave
};

const KEY = "doris.journal-drafts";

export function loadDrafts(): StoryDraft[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as StoryDraft[]) : [];
    return Array.isArray(list) ? list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
  } catch {
    return [];
  }
}

export function loadDraft(id: string): StoryDraft | undefined {
  return loadDrafts().find((d) => d.id === id);
}

export function saveDraft(draft: StoryDraft) {
  try {
    const others = loadDrafts().filter((d) => d.id !== draft.id);
    window.localStorage.setItem(KEY, JSON.stringify([draft, ...others]));
  } catch {
    // Storage can be blocked (private windows); the form still works without autosave.
  }
}

export function deleteDraft(id: string) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(loadDrafts().filter((d) => d.id !== id)));
  } catch {
    // Nothing to do if storage is unavailable.
  }
}

export const newDraftId = () => `d_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

