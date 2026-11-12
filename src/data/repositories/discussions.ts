import { DISCUSSIONS } from "@/data/mock/discussions";
import { MEMBERS } from "@/data/mock/members";
import { REPLIES } from "@/data/mock/replies";
import type { Discussion, Member, Reply } from "@/data/types";

/** Public reading only. Soft-deleted and hidden discussions never appear in public lists. */
const withCounts = (d: Discussion): Discussion => ({
  ...d,
  replyCount: REPLIES.filter((r) => r.discussionId === d.id && r.status === "published").length,
});

export async function getDiscussions(): Promise<Discussion[]> {
  return DISCUSSIONS.filter((d) => d.status === "published")
    .map(withCounts)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDiscussionById(id: string) {
  const d = DISCUSSIONS.find((x) => x.id === id && x.status === "published");
  return d ? withCounts(d) : null;
}

export async function getReplies(): Promise<Reply[]> {
  return REPLIES;
}

export async function getRepliesForDiscussion(discussionId: string): Promise<Reply[]> {
  return REPLIES.filter((r) => r.discussionId === discussionId).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

export async function getMemberById(id: string): Promise<Member | null> {
  return MEMBERS.find((m) => m.id === id) ?? null;
}

export async function getMemberByUsername(username: string): Promise<Member | null> {
  return MEMBERS.find((m) => m.username === username) ?? null;
}

export async function getMembers(): Promise<Member[]> {
  return MEMBERS;
}
