"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { TimeAgo } from "@/components/shared/time-ago";
import type { Discussion, Member, Reply } from "@/data/types";
import { useSession } from "@/features/auth/session-provider";
import { canParticipateInCommunity } from "@/lib/permissions";
import { AuthorChip } from "./author-chip";
import {
  mergeDiscussions,
  mergeReplies,
  publicReplyCount,
  reactionsFor,
  repliesFor,
  targetKey,
} from "./community-data";
import { community, useCommunityState } from "./community-store";
import { DiscussionComposer } from "./discussion-composer";
import { ReactionButton } from "./reaction-button";
import { ReplyComposer } from "./reply-composer";
import { EditedNote, ReplyItem } from "./reply-item";
import { ReportButton } from "./report-button";

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <EmptyState
      title={title}
      description={body}
      action={{ label: "Back to the community", href: "/community" }}
      className="mx-auto my-16 max-w-xl"
    />
  );
}

export function DiscussionThread({
  id,
  seedDiscussions,
  seedReplies,
  members,
}: {
  id: string;
  seedDiscussions: Discussion[];
  seedReplies: Reply[];
  members: Member[];
}) {
  const router = useRouter();
  const { user } = useSession();
  const state = useCommunityState();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const byId = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const discussions = useMemo(() => mergeDiscussions(seedDiscussions, state), [seedDiscussions, state]);
  const replies = useMemo(() => mergeReplies(seedReplies, state), [seedReplies, state]);
  const d = discussions.find((x) => x.id === id);

  if (!d) {
    return <Notice title="Discussion not found" body="This discussion doesn't exist, or the link may be out of date." />;
  }
  if (d.status === "deleted") {
    return <Notice title="This discussion was removed" body="Its author deleted it, so it and its replies are no longer public." />;
  }
  if (d.status === "hidden") {
    return <Notice title="This discussion is hidden" body="It's hidden while moderators review a report." />;
  }

  const author = byId.get(d.authorId);
  const isOwner = !!user && user.id === d.authorId && canParticipateInCommunity(user);
  const thread = repliesFor(d.id, replies);
  const count = publicReplyCount(d.id, replies);
  const more = discussions
    .filter((x) => x.category === d.category && x.id !== d.id && x.status === "published")
    .slice(0, 4);
  const paragraphs = d.body.split(/\n{2,}/);

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
      <article>
        <nav aria-label="Breadcrumb" className="mb-6 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <Link href="/community" className="hover:text-foreground">
            Community
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/community?category=${d.category}`} className="text-white hover:underline">
            {d.category}
          </Link>
        </nav>
        <h1 className="display-name text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1]">{d.title}</h1>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
          <AuthorChip member={author} />
          <p className="text-xs text-muted-foreground">
            <TimeAgo iso={d.createdAt} />{" "}
            <EditedNote at={d.editedAt} />
          </p>
        </div>

        <div className="mt-8 space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[1.0625rem] leading-[1.8] text-reading">
              {p}
            </p>
          ))}
        </div>

        <div className="-ml-3 mt-6 flex flex-wrap items-center gap-1">
          <ReactionButton type="discussion" id={d.id} baseCount={d.reactionCount} />
          <ReportButton type="discussion" id={d.id} authorId={d.authorId} />
          {isOwner && (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setEditOpen(true)}>
                <Pencil aria-hidden="true" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setDeleteOpen(true)}>
                <Trash2 aria-hidden="true" /> Delete
              </Button>
            </>
          )}
        </div>

        <section aria-labelledby="replies-heading" className="mt-12">
          <h2 id="replies-heading" className="heading-section text-2xl">
            {count} {count === 1 ? "reply" : "replies"}
          </h2>
          {thread.length === 0 ? (
            <p className="mt-6 border-t border-border pt-6 text-sm text-muted-foreground">
              No replies yet. Start the conversation below.
            </p>
          ) : (
            <ol className="mt-4">
              {thread.map((r) => (
                <ReplyItem
                  key={r.id}
                  reply={r}
                  author={byId.get(r.authorId)}
                  canEdit={!!user && user.id === r.authorId && canParticipateInCommunity(user)}
                />
              ))}
            </ol>
          )}
          <div className="mt-8 border-t border-border pt-8">
            <ReplyComposer discussionId={d.id} />
          </div>
        </section>
      </article>

      <aside aria-label="Discussion context" className="space-y-8">
        <div className="border border-border bg-surface p-5">
          <p className="tag text-white/60">Category</p>
          <p className="mt-1 heading-card text-xl">{d.category}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {count} {count === 1 ? "reply" : "replies"} · {reactionsFor(d.reactionCount, targetKey("discussion", d.id), state)} reactions
          </p>
        </div>
        {more.length > 0 && (
          <div>
            <h2 className="tag text-white/60">More in {d.category}</h2>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {more.map((m) => (
                <li key={m.id}>
                  <Link href={`/community/${m.id}`} className="block py-3 text-sm font-semibold leading-snug hover:underline hover:underline-offset-4">
                    {m.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Badge variant="outline">Everyone can read. Members can reply.</Badge>
      </aside>

      {isOwner && (
        <>
          <DiscussionComposer open={editOpen} onOpenChange={setEditOpen} authorId={d.authorId} discussion={d} />
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete this discussion?"
            description="It will be removed from the public feed, and its replies will no longer be visible. This can't be undone from your side."
            confirmLabel="Delete discussion"
            destructive
            onConfirm={() => {
              community.softDeleteDiscussion(d.id);
              toast.success("Discussion deleted");
              router.push("/community");
            }}
          />
        </>
      )}
    </div>
  );
}
