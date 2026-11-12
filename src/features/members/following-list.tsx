"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import type { Filmmaker, Member } from "@/data/types";
import { useSession } from "@/features/auth/session-provider";
import { AuthorChip } from "@/features/community/author-chip";
import { FilmmakerPortrait } from "@/features/filmmakers/filmmaker-card";
import { engagement, useEngagement } from "./engagement-store";
import { followId } from "./follow-id";

export function FollowingList({ filmmakers, members }: { filmmakers: Filmmaker[]; members: Member[] }) {
  const { user } = useSession();
  const { following } = useEngagement();
  const ids = user ? (following[user.id] ?? []) : [];

  const fms = ids.flatMap((id) => {
    const f = filmmakers.find((x) => followId.filmmaker(x.slug) === id);
    return f ? [f] : [];
  });
  const mems = ids.flatMap((id) => {
    const m = members.find((x) => followId.member(x.username) === id);
    return m ? [m] : [];
  });

  const unfollow = (target: string, name: string) => {
    if (!user) return;
    engagement.toggleFollow(user.id, target);
    toast(`Unfollowed ${name}`, {
      action: { label: "Undo", onClick: () => engagement.toggleFollow(user.id, target) },
    });
  };

  if (fms.length + mems.length === 0) {
    return (
      <EmptyState
        icon={<Users />}
        title="You're not following anyone yet"
        description="Follow filmmakers and members to keep their work close. Start with the filmmaker directory."
        action={{ label: "Discover filmmakers", href: "/filmmakers" }}
      />
    );
  }

  return (
    <div className="space-y-14">
      {fms.length > 0 && (
        <section aria-labelledby="fl-heading">
          <h2 id="fl-heading" className="type-eyebrow mb-5 font-sans text-gold">
            Filmmakers · {fms.length}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fms.map((f) => (
              <li key={f.id} className="flex gap-4 border border-border p-4">
                <Link href={`/filmmakers/${f.slug}`} className="w-20 shrink-0">
                  <FilmmakerPortrait filmmaker={f} aspect="aspect-[3/4]" sizes="80px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/filmmakers/${f.slug}`} className="font-display text-lg font-black leading-tight hover:text-gold">
                    {f.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {f.primaryDiscipline} · {f.country}
                  </p>
                  <Button
                    variant="outline"
                    size="xs"
                    className="mt-auto w-fit"
                    onClick={() => unfollow(followId.filmmaker(f.slug), f.name)}
                  >
                    Unfollow
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {mems.length > 0 && (
        <section aria-labelledby="ml-heading">
          <h2 id="ml-heading" className="type-eyebrow mb-5 font-sans text-gold">
            Members · {mems.length}
          </h2>
          <ul className="divide-y divide-border border-y border-border">
            {mems.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <AuthorChip member={m} />
                <Button variant="outline" size="xs" onClick={() => unfollow(followId.member(m.username), m.displayName)}>
                  Unfollow
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
