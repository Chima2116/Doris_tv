"use client";

import Link from "next/link";
import { Lock, MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initials } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Eyebrow } from "@/components/shared/eyebrow";
import { TimeAgo } from "@/components/shared/time-ago";
import { formatDate } from "@/lib/format";
import type { Discussion, Filmmaker, JournalArticle, Member, ProfileSection, Reply } from "@/data/types";
import { useSession } from "@/features/auth/session-provider";
import { mergeDiscussions, mergeReplies } from "@/features/community/community-data";
import { useCommunityState } from "@/features/community/community-store";
import { ArticleCard } from "@/features/journal/article-card";
import { useEngagement } from "./engagement-store";
import { FollowButton } from "./follow-button";
import { followId } from "./follow-id";
import { applyMemberPatch, isSectionVisible, useMemberStore } from "./member-store";

function Private({ name, what }: { name: string; what: string }) {
  return (
    <div className="flex items-center gap-3 border border-dashed border-border p-6 text-sm text-muted-foreground">
      <Lock className="size-4 shrink-0" aria-hidden="true" />
      {name} keeps their {what} private.
    </div>
  );
}

export function ProfileView({
  seed,
  seedDiscussions,
  seedReplies,
  members,
  articles,
  filmmakers,
}: {
  seed: Member;
  seedDiscussions: Discussion[];
  seedReplies: Reply[];
  members: Member[];
  articles: JournalArticle[];
  filmmakers: Filmmaker[];
}) {
  const { user } = useSession();
  const { patches } = useMemberStore();
  const community = useCommunityState();
  const { saved, following } = useEngagement();

  const member = applyMemberPatch(seed, patches);
  const isOwner = user?.id === member.id;
  const show = (s: ProfileSection) => isSectionVisible(member, s, isOwner);
  const hiddenFromOthers = (s: ProfileSection) => isOwner && !isSectionVisible(member, s, false);
  const isPrivate = member.profileVisibility === "private";
  const firstName = member.displayName.split(" ")[0];

  const activity = (() => {
    const ds = mergeDiscussions(seedDiscussions, community);
    const published = new Set(ds.filter((d) => d.status === "published").map((d) => d.id));
    const mine = [
      ...ds
        .filter((d) => d.authorId === member.id && d.status === "published")
        .map((d) => ({ key: d.id, kind: "Discussion", title: d.title, href: `/community/${d.id}`, at: d.createdAt })),
      ...mergeReplies(seedReplies, community)
        .filter((r) => r.authorId === member.id && r.status === "published" && published.has(r.discussionId))
        .map((r) => ({
          key: r.id,
          kind: "Reply",
          title: ds.find((d) => d.id === r.discussionId)?.title ?? "a discussion",
          href: `/community/${r.discussionId}#${r.id}`,
          at: r.createdAt,
        })),
    ];
    return mine.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);
  })();

  const followed = (following[member.id] ?? []).flatMap((id) => {
    const f = filmmakers.find((x) => followId.filmmaker(x.slug) === id);
    if (f) return [{ id, name: f.name, href: `/filmmakers/${f.slug}`, sub: `${f.primaryDiscipline} · ${f.country}` }];
    const m = members.find((x) => followId.member(x.username) === id);
    return m ? [{ id, name: m.displayName, href: `/profile/${m.username}`, sub: `@${m.username}` }] : [];
  });
  const savedArticles = (saved[member.id] ?? [])
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is JournalArticle => !!a);

  const filmmaker = member.filmmakerId ? filmmakers.find((f) => f.id === member.filmmakerId) : undefined;
  const roles = member.roles.filter((r) => r !== "member");

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-5 py-14 sm:px-6 md:grid-cols-[auto_1fr_auto] md:items-center lg:px-8">
          <Avatar className="size-24 sm:size-28">
            <AvatarFallback className="bg-elevated font-display text-3xl font-black">
              {initials(member.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Eyebrow>Member</Eyebrow>
            <h1 className="type-display-lg mt-2 !text-[clamp(2rem,5vw,3.5rem)]">{member.displayName}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>@{member.username}</span>
              <span aria-hidden="true">·</span>
              <span>Member since {formatDate(member.memberSince, { day: undefined })}</span>
              {member.location && show("location") && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {member.location}
                    {hiddenFromOthers("location") && <Badge variant="outline">Only you</Badge>}
                  </span>
                </>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {roles.map((r) => (
                <Badge key={r} variant={r === "filmmaker" ? "gold" : "outline"}>
                  {r}
                </Badge>
              ))}
              {isPrivate && (
                <Badge variant="outline">
                  <Lock aria-hidden="true" /> Private profile
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isOwner ? (
              <Button asChild variant="outline">
                <Link href="/settings">Edit profile</Link>
              </Button>
            ) : (
              <FollowButton target={followId.member(member.username)} name={member.displayName} />
            )}
            {filmmaker && (
              <Button asChild variant="ghost">
                <Link href={`/filmmakers/${filmmaker.slug}`}>Filmmaker profile →</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-6 lg:px-8">
        {isOwner && isPrivate && (
          <p role="note" className="mb-8 border border-gold/40 bg-gold/5 p-4 text-sm text-reading/80">
            Your profile is private. People can still find you, but they only see your name, username
            and join date. <Link href="/settings#privacy" className="text-gold underline">Change privacy</Link>
          </p>
        )}

        <section aria-label="Biography" className="mb-12 max-w-2xl">
          {show("bio") ? (
            member.bio ? (
              <p className="text-lg leading-relaxed text-reading">
                {member.bio}
                {hiddenFromOthers("bio") && <Badge variant="outline" className="ml-2 align-middle">Only you</Badge>}
              </p>
            ) : isOwner ? (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t written a bio yet. <Link href="/settings" className="text-gold underline">Add one</Link>
              </p>
            ) : null
          ) : (
            <Private name={firstName} what="biography" />
          )}
        </section>

        <Tabs defaultValue="activity">
          <TabsList>
            {[
              ["activity", "Activity"],
              ["following", "Following"],
              ["saved", "Saved reading"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v}>
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="activity">
            {!show("activity") ? (
              <Private name={firstName} what="community activity" />
            ) : activity.length === 0 ? (
              <EmptyState title="No activity yet" description={`${firstName} hasn't posted in the Community yet.`} action={{ label: "Visit the Community", href: "/community" }} />
            ) : (
              <>
                {hiddenFromOthers("activity") && <Badge variant="outline" className="mb-4">Only you</Badge>}
                <ul className="divide-y divide-border border-y border-border">
                  {activity.map((a) => (
                    <li key={a.key} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                      <p className="min-w-0">
                        <span className="type-eyebrow mr-3 text-gold">{a.kind}</span>
                        <Link href={a.href} className="font-semibold hover:text-gold">
                          {a.title}
                        </Link>
                      </p>
                      <TimeAgo iso={a.at} className="text-xs text-muted-foreground" />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </TabsContent>

          <TabsContent value="following">
            {!show("following") ? (
              <Private name={firstName} what="following list" />
            ) : followed.length === 0 ? (
              <EmptyState title="Not following anyone yet" description={isOwner ? "Follow filmmakers and members to see them here." : `${firstName} isn't following anyone yet.`} action={isOwner ? { label: "Discover filmmakers", href: "/filmmakers" } : undefined} />
            ) : (
              <>
                {hiddenFromOthers("following") && <Badge variant="outline" className="mb-4">Only you</Badge>}
                <ul className="grid gap-3 sm:grid-cols-2">
                  {followed.map((f) => (
                    <li key={f.id}>
                      <Link href={f.href} className="block border border-border p-4 transition-colors hover:border-gold">
                        <span className="block font-display text-lg font-black">{f.name}</span>
                        <span className="text-xs text-muted-foreground">{f.sub}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </TabsContent>

          <TabsContent value="saved">
            {!show("saved") ? (
              <Private name={firstName} what="saved reading" />
            ) : savedArticles.length === 0 ? (
              <EmptyState title="No saved stories" description={isOwner ? "Save stories from the Journal and they'll appear here." : `${firstName} hasn't saved any stories yet.`} action={isOwner ? { label: "Browse the Journal", href: "/journal" } : undefined} />
            ) : (
              <>
                {hiddenFromOthers("saved") && <Badge variant="outline" className="mb-4">Only you</Badge>}
                <ul className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                  {savedArticles.map((a) => (
                    <li key={a.id}>
                      <ArticleCard article={a} variant={a.category === "Video" ? "video" : "standard"} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
