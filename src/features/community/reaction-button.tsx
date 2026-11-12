"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session-provider";
import { cn } from "@/lib/utils";
import { reactionsFor, targetKey } from "./community-data";
import { community, useCommunityState } from "./community-store";

/** Toggle reaction with live count. Guests are prompted rather than blocked from seeing counts. */
export function ReactionButton({
  type,
  id,
  baseCount,
  className,
}: {
  type: "discussion" | "reply";
  id: string;
  baseCount: number;
  className?: string;
}) {
  const { user, requestAction } = useSession();
  const state = useCommunityState();
  const key = targetKey(type, id);
  const reacted = !!user && !!state.reactions[user.id]?.includes(key);
  const count = reactionsFor(baseCount, key, state);

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("text-muted-foreground", reacted && "text-gold", className)}
      aria-pressed={reacted}
      aria-label={`${reacted ? "Remove reaction" : "React"} (${count} reactions)`}
      onClick={() => requestAction("react", (m) => community.toggleReaction(m.id, key))}
    >
      <Heart className={reacted ? "fill-current" : ""} aria-hidden="true" />
      {count}
    </Button>
  );
}
