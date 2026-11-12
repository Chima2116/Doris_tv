import Link from "next/link";
import { MessageSquare, Heart } from "lucide-react";
import { getMemberById } from "@/data/repositories/discussions";
import { timeAgo } from "@/lib/format";
import type { Discussion } from "@/data/types";

/** Compact discussion row used for the homepage preview. */
export async function DiscussionPreview({ discussion }: { discussion: Discussion }) {
  const author = await getMemberById(discussion.authorId);
  return (
    <li>
      <Link
        href={`/community/${discussion.id}`}
        className="group flex flex-col gap-2 border-t border-border py-5 transition-colors hover:bg-white/[0.02]"
      >
        <span className="type-eyebrow text-gold">{discussion.category}</span>
        <span className="font-display text-lg font-black leading-snug group-hover:text-gold">
          {discussion.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground/80">{author?.displayName ?? "Member"}</span> ·{" "}
            {timeAgo(discussion.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" aria-hidden="true" />
            {discussion.replyCount}
            <span className="sr-only"> replies</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="size-3.5" aria-hidden="true" />
            {discussion.reactionCount}
            <span className="sr-only"> reactions</span>
          </span>
        </span>
      </Link>
    </li>
  );
}
