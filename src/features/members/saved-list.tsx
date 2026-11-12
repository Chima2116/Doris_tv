"use client";

import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import type { JournalArticle } from "@/data/types";
import { useSession } from "@/features/auth/session-provider";
import { ArticleCard } from "@/features/journal/article-card";
import { engagement, useEngagement } from "./engagement-store";

export function SavedList({ articles }: { articles: JournalArticle[] }) {
  const { user } = useSession();
  const { saved } = useEngagement();
  const slugs = user ? (saved[user.id] ?? []) : [];
  const items = slugs
    .map((s) => articles.find((a) => a.slug === s))
    .filter((a): a is JournalArticle => !!a);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark />}
        title="Nothing saved yet"
        description="Use Save on any Journal story and it will collect here for later. Find something to read in the Journal."
        action={{ label: "Browse the Journal", href: "/journal" }}
      />
    );
  }

  return (
    <>
      <p className="mb-8 text-sm text-muted-foreground" role="status" aria-live="polite">
        {items.length} saved {items.length === 1 ? "story" : "stories"}
      </p>
      <ul className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <li key={a.id}>
            <ArticleCard article={a} variant={a.category === "Video" ? "video" : "standard"} />
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 -ml-3 text-muted-foreground"
              onClick={() => {
                if (!user) return;
                engagement.toggleSaved(user.id, a.slug);
                toast("Removed from saved", {
                  action: { label: "Undo", onClick: () => engagement.toggleSaved(user.id, a.slug) },
                });
              }}
            >
              Remove from saved
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
