"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { DISCUSSION_CATEGORIES } from "@/data/mock/discussions";
import type { Discussion, Member, Reply } from "@/data/types";
import { useSession } from "@/features/auth/session-provider";
import { canParticipateInCommunity } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { DiscussionCard } from "./discussion-card";
import { NewDiscussionButton } from "./new-discussion-button";
import {
  mergeDiscussions,
  mergeReplies,
  publicReplyCount,
  reactionsFor,
  targetKey,
} from "./community-data";
import { useCommunityState } from "./community-store";

const SORTS = [
  { value: "latest", label: "Latest" },
  { value: "replies", label: "Most replies" },
  { value: "reactions", label: "Most reactions" },
] as const;
const PAGE = 6;

export function CommunityFeed({
  seedDiscussions,
  seedReplies,
  members,
}: {
  seedDiscussions: Discussion[];
  seedReplies: Reply[];
  members: Member[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { user } = useSession();
  const state = useCommunityState();
  const [shown, setShown] = useState(PAGE);

  const category = params.get("category") ?? "";
  const sort = (SORTS.find((s) => s.value === params.get("sort"))?.value ?? "latest") as (typeof SORTS)[number]["value"];

  const byId = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const replies = useMemo(() => mergeReplies(seedReplies, state), [seedReplies, state]);
  // Public feed: published only. Soft-deleted and hidden discussions (and their replies) never appear.
  const all = useMemo(
    () => mergeDiscussions(seedDiscussions, state).filter((d) => d.status === "published"),
    [seedDiscussions, state],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of all) c[d.category] = (c[d.category] ?? 0) + 1;
    return c;
  }, [all]);

  const rows = useMemo(() => {
    const filtered = category ? all.filter((d) => d.category === category) : all;
    const stat = (d: Discussion) => ({
      replies: publicReplyCount(d.id, replies),
      reactions: reactionsFor(d.reactionCount, targetKey("discussion", d.id), state),
    });
    return [...filtered]
      .map((d) => ({ d, ...stat(d) }))
      .sort((a, b) =>
        sort === "replies"
          ? b.replies - a.replies
          : sort === "reactions"
            ? b.reactions - a.reactions
            : b.d.createdAt.localeCompare(a.d.createdAt),
      );
  }, [all, category, sort, replies, state]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    setShown(PAGE);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const eligible = canParticipateInCommunity(user);
  const totalReplies = all.reduce((n, d) => n + publicReplyCount(d.id, replies), 0);

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <nav aria-label="Discussion categories" className="-mx-1 overflow-x-auto">
            <ul className="flex min-w-max gap-6 px-1">
              {["", ...DISCUSSION_CATEGORIES].map((c) => {
                const active = c === category;
                return (
                  <li key={c || "all"}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setParam("category", c || null)}
                      className={cn(
                        "border-b-2 py-2 text-sm font-semibold transition-colors",
                        active ? "border-gold text-white" : "border-transparent text-white/60 hover:text-white",
                      )}
                    >
                      {c || "All"}
                      <span className="ml-1.5 text-xs font-normal tabular-nums text-white/45">
                        {c ? (counts[c] ?? 0) : all.length}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <Label htmlFor="feed-sort" className="sr-only">
              Sort discussions
            </Label>
            <Select value={sort} onValueChange={(v) => setParam("sort", v === "latest" ? null : v)}>
              <SelectTrigger id="feed-sort" className="h-10 w-44 bg-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<MessagesSquare />}
            title={category ? `No discussions in ${category} yet` : "No discussions yet"}
            description={
              eligible
                ? "Be the first to start a conversation here."
                : "Members can start discussions here. Join the waitlist and create an account to take part."
            }
            action={category ? { label: "View all discussions", onClick: () => setParam("category", null) } : undefined}
          />
        ) : (
          <>
            <p className="sr-only" role="status" aria-live="polite">
              {rows.length} discussions
            </p>
            <div className="border-b border-border">
              {rows.slice(0, shown).map(({ d, replies: rc, reactions }) => (
                <DiscussionCard key={d.id} discussion={d} author={byId.get(d.authorId)} replies={rc} reactions={reactions} />
              ))}
            </div>
            {rows.length > shown && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={() => setShown((n) => n + PAGE)}>
                  Show more discussions
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <aside className="space-y-8" aria-label="About the community">
        <div className="bg-[#1c1c1c] p-6">
          <h2 className="heading-card text-xl">Join the conversation</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            Anyone can read. Members on the waitlist with a verified email can start discussions,
            reply and react.
          </p>
          <NewDiscussionButton className="mt-5 w-full" />
        </div>
        <dl className="grid grid-cols-2 gap-6 border-y border-border py-6">
          <div>
            <dd className="text-3xl font-black tabular-nums">{all.length}</dd>
            <dt className="tag text-white/55">Discussions</dt>
          </div>
          <div>
            <dd className="text-3xl font-black tabular-nums">{totalReplies}</dd>
            <dt className="tag text-white/55">Replies</dt>
          </div>
        </dl>
        <div>
          <h2 className="tag text-white/70">Community guidelines</h2>
          <ul className="mt-3 space-y-2 text-sm text-reading/70">
            <li>Critique the work, not the person.</li>
            <li>Say what you saw. Specific beats clever.</li>
            <li>Credit others&apos; ideas and link your sources.</li>
            <li>
              See something wrong? Use <strong className="text-foreground">Report</strong>.
            </li>
          </ul>
          <Link href="/about" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 hover:text-white">
            About DORIS TV →
          </Link>
        </div>
      </aside>
    </div>
  );
}
