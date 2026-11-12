"use client";

import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session-provider";
import { engagement, useEngagement } from "./engagement-store";

export function FollowButton({
  target,
  name,
  size = "default",
  className,
}: {
  target: string;
  name: string;
  size?: "default" | "sm";
  className?: string;
}) {
  const { user, requestAction } = useSession();
  const { following: followingMap } = useEngagement();
  const following = !!user && !!followingMap[user.id]?.includes(target);

  return (
    <Button
      variant={following ? "outline" : "default"}
      size={size}
      className={className}
      aria-pressed={following}
      onClick={() =>
        requestAction("follow", (member) => {
          const was = !!engagement.getSnapshot().following[member.id]?.includes(target);
          engagement.toggleFollow(member.id, target);
          toast.success(was ? `Unfollowed ${name}` : `Following ${name}`);
        })
      }
    >
      {following ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
      {following ? "Following" : "Follow"}
    </Button>
  );
}
