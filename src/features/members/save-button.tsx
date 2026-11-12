"use client";

import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session-provider";
import { engagement, useEngagement } from "./engagement-store";

export function SaveButton({ slug, className }: { slug: string; className?: string }) {
  const { user, requestAction } = useSession();
  const { saved: savedMap } = useEngagement();
  const saved = !!user && !!savedMap[user.id]?.includes(slug);

  return (
    <Button
      variant={saved ? "default" : "outline"}
      size="sm"
      className={className}
      aria-pressed={saved}
      onClick={() =>
        requestAction("save", (member) => {
          const wasSaved = !!engagement.getSnapshot().saved[member.id]?.includes(slug);
          engagement.toggleSaved(member.id, slug);
          toast.success(wasSaved ? "Removed from saved" : "Saved to your reading list");
        })
      }
    >
      <Bookmark className={saved ? "fill-current" : ""} aria-hidden="true" />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
