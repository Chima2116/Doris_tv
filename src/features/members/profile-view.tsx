"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Lock, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { TimeAgo } from "@/components/shared/time-ago";
import { formatDate } from "@/lib/format";
import type { Discussion, Filmmaker, JournalArticle, Member, ProfileSection, Reply } from "@/data/types";
import { useSession } from "@/features/auth/session-provider";
import { mergeDiscussions, mergeReplies } from "@/features/community/community-data";
import { useCommunityState } from "@/features/community/community-store";
import { FilmmakerCallout } from "./filmmaker-callout";
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

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 font-display text-lg font-bold text-reading">{children}</dd>
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

  const filmmaker = member.filmmakerId ? filmmakers.find((f) => f.id === member.filmmakerId) : undefined;
  const isFilmmaker = !!filmmaker || member.roles.includes("filmmaker");
  const approved = !!filmmaker && filmmaker.verificationStatus === "verified" && filmmaker.publicationStatus === "published";
  const based = filmmaker?.location ? `${filmmaker.location}, ${filmmaker.country}` : filmmaker?.country;
  // The filmmaker portrait is the one profile photo, edited only in the filmmaker profile.
  const photo = filmmaker?.portraitUrl;

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-5 py-14 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-6 sm:gap-8">
            <Avatar className="size-24 shrink-0 sm:size-32">
              {photo && <AvatarImage src={photo} alt="" />}
              <AvatarFallback className="bg-elevated font-display text-3xl font-black">{initials(member.displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold">
                {isFilmmaker ? "Filmmaker" : "Member"}
              </p>
              <h1 className="mt-2 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-black leading-[1.02] tracking-[-0.02em]">
                {member.displayName}
              </h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
                <span>@{member.username}</span>
                <span aria-hidden="true">·</span>
                <span>Joined {formatDate(member.memberSince, { day: undefined })}</span>
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
                {isPrivate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1"><Lock className="size-3.5" aria-hidden="true" /> Private</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            {isOwner ? (
              <Button asChild variant="outline" size="lg">
                <Link href="/edit-profile">Edit profile</Link>
              </Button>
            ) : (
              <FollowButton target={followId.member(member.username)} name={member.displayName} />
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:px-6 lg:px-8">
        {isOwner && isPrivate && (
          <p role="note" className="mb-12 border border-gold/40 bg-gold/5 p-4 text-sm text-reading/80">
            Your profile is private. People can still find you, but they only see your name, username
            and join date. <Link href="/settings#privacy" className="text-gold underline">Change privacy</Link>
          </p>
        )}

        {filmmaker && (approved || isOwner) && (
          <section aria-labelledby="filmmaker-heading" className="mb-16 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-14">
            <div className="relative aspect-[4/5] w-full max-w-[240px] overflow-hidden bg-elevated">
              {filmmaker.portraitUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- a portrait chosen by the filmmaker
                <img src={filmmaker.portraitUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="absolute inset-0 grid place-items-center font-display text-6xl font-black text-white/30" aria-hidden="true">
                  {initials(filmmaker.name)}
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="filmmaker-heading" className="font-display text-2xl font-black tracking-[-0.01em] sm:text-3xl">
                  Filmmaker profile
                </h2>
                {approved ? (
                  <span className="inline-flex items-center gap-2 border border-gold/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-gold">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" /> Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden="true" /> Awaiting approval
                  </span>
                )}
              </div>

              <dl className="mt-6 grid grid-cols-2 divide-x divide-border border-y border-border sm:grid-cols-4">
                <div className="px-0 sm:px-6 first:pl-0">
                  <Fact label="Discipline">{filmmaker.primaryDiscipline}</Fact>
                </div>
                <div className="px-4 sm:px-6">
                  <Fact label="Based in">{based ?? "Not set"}</Fact>
                </div>
                <div className="px-0 sm:px-6">
                  <Fact label="Credits">{filmmaker.credits.length}</Fact>
                </div>
                <div className="px-4 sm:px-6">
                  <Fact label="Years active">{filmmaker.yearsActive ?? "Not set"}</Fact>
                </div>
              </dl>

              {isOwner && (
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                  <Link href="/filmmaker-dashboard/profile" className="font-semibold text-gold underline underline-offset-4">
                    Edit filmmaker profile
                  </Link>
                  {approved && (
                    <Link href={`/filmmakers/${filmmaker.slug}`} className="text-reading/80 underline underline-offset-4 hover:text-gold">
                      View public profile
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {!filmmaker && isOwner && isFilmmaker && (
          <section aria-labelledby="filmmaker-heading" className="mb-16 flex flex-col gap-4 border-t border-border pt-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="filmmaker-heading" className="font-display text-2xl font-black">Filmmaker profile</h2>
              <p className="mt-2 text-muted-foreground">Your filmmaker profile isn&apos;t set up yet.</p>
            </div>
            <Button asChild>
              <Link href="/filmmaker-dashboard/profile">Set up profile</Link>
            </Button>
          </section>
        )}
        {!filmmaker && isOwner && !isFilmmaker && <FilmmakerCallout className="mb-16 border-t border-border pt-10" />}

        <section aria-labelledby="bio-heading" className="mb-16 max-w-2xl">
          <h2 id="bio-heading" className="sr-only">Biography</h2>
          {show("bio") ? (
            member.bio ? (
              <p className="font-display text-xl leading-relaxed text-reading/90">
                {member.bio}
                {hiddenFromOthers("bio") && <Badge variant="outline" className="ml-2 align-middle">Only you</Badge>}
              </p>
            ) : isOwner ? (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t written a bio yet.{" "}
                <Link href="/edit-profile" className="text-gold underline">Add one</Link>
              </p>
            ) : null
          ) : (
            <Private name={firstName} what="biography" />
          )}
        </section>

        <section aria-labelledby="activity-heading" className="border-t border-border pt-12">
          <h2 id="activity-heading" className="font-display text-2xl font-black sm:text-3xl">Activity</h2>
          <div className="mt-8">
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
          </div>
        </section>
      </div>
    </>
  );
}
