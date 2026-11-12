import Link from "next/link";
import { Heart, MessageSquare } from "lucide-react";
import { TimeAgo } from "@/components/shared/time-ago";
import type { Discussion, Member } from "@/data/types";
import { AuthorChip } from "./author-chip";

const preview = (body: string, n = 190) => {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > n ? `${flat.slice(0, n).trimEnd()}…` : flat;
};

/** Feed row. The title link stretches over the card; the author link sits above it. */
export function DiscussionCard({
  discussion,
  author,
  replies,
  reactions,
}: {
  discussion: Discussion;
  author?: Member;
  replies: number;
  reactions: number;
}) {
  return (
    <article className="group relative border-t border-white/20 py-7 transition-colors hover:bg-white/[0.03] sm:px-3">
      <div className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-2">
        <AuthorChip member={author} size="sm" />
        <span className="tag text-white/60">{discussion.category}</span>
      </div>
      <h3 className="heading-card text-[1.375rem] leading-snug">
        <Link
          href={`/community/${discussion.id}`}
          className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4 focus-visible:outline-offset-[-2px]"
        >
          {discussion.title}
        </Link>
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">{preview(discussion.body)}</p>
      <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 meta text-white/55">
        <TimeAgo iso={discussion.createdAt} />
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="size-3.5" aria-hidden="true" />
          {replies} <span className="sr-only">replies</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Heart className="size-3.5" aria-hidden="true" />
          {reactions} <span className="sr-only">reactions</span>
        </span>
      </p>
    </article>
  );
}
