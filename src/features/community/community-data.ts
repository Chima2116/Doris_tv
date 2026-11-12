import type { Discussion, ModerationReport, Reply } from "@/data/types";

/**
 * Pure helpers that merge the immutable server-rendered seed with the client-side
 * community state (new posts, edits, soft-deletes, reactions, reports).
 * Shared by the public Community UI and, in Phase 5, admin moderation.
 */
export type DiscussionPatch = Partial<
  Pick<Discussion, "title" | "body" | "category" | "editedAt" | "status" | "deletedAt" | "hiddenReason">
>;
export type ReplyPatch = Partial<Pick<Reply, "body" | "editedAt" | "status" | "hiddenReason">>;

export type CommunityState = {
  createdDiscussions: Discussion[];
  discussionPatches: Record<string, DiscussionPatch>;
  createdReplies: Reply[];
  replyPatches: Record<string, ReplyPatch>;
  /** userId -> reacted target keys ("d:<id>" | "r:<id>") */
  reactions: Record<string, string[]>;
  reports: ModerationReport[];
  /** Moderator and admin changes to any report (seeded or member-submitted). */
  reportPatches: Record<string, Partial<ModerationReport>>;
};

export const EMPTY_COMMUNITY: CommunityState = {
  createdDiscussions: [],
  discussionPatches: {},
  createdReplies: [],
  replyPatches: {},
  reactions: {},
  reports: [],
  reportPatches: {},
};

export const targetKey = (type: "discussion" | "reply", id: string) =>
  `${type === "discussion" ? "d" : "r"}:${id}`;

/** All discussions (any status) with patches applied. Callers filter by status for public views. */
export function mergeDiscussions(seed: Discussion[], s: CommunityState): Discussion[] {
  return [...s.createdDiscussions, ...seed].map((d) => ({ ...d, ...s.discussionPatches[d.id] }));
}

export function mergeReplies(seed: Reply[], s: CommunityState): Reply[] {
  return [...seed, ...s.createdReplies].map((r) => ({ ...r, ...s.replyPatches[r.id] }));
}

export function reactionsFor(base: number, key: string, s: CommunityState) {
  let n = base;
  for (const targets of Object.values(s.reactions)) if (targets.includes(key)) n++;
  return n;
}

/** Replies shown publicly: only on published discussions. Hidden replies stay (rendered as a notice). */
export function repliesFor(discussionId: string, replies: Reply[]) {
  return replies
    .filter((r) => r.discussionId === discussionId && r.status !== "deleted")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export const publicReplyCount = (discussionId: string, replies: Reply[]) =>
  replies.filter((r) => r.discussionId === discussionId && r.status === "published").length;

export function mergeReports(seed: ModerationReport[], s: CommunityState): ModerationReport[] {
  return [...seed, ...s.reports].map((r) => ({ ...r, ...s.reportPatches[r.id] }));
}
