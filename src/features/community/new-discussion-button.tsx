"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session-provider";
import { DiscussionComposer } from "./discussion-composer";

/** "Start a discussion": prompts guests, opens the composer for eligible members. */
export function NewDiscussionButton({
  className,
  variant = "default",
  label = "Start a discussion",
  goToThread = false,
}: {
  className?: string;
  variant?: "default" | "outline";
  label?: string;
  goToThread?: boolean;
}) {
  const { requestAction } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authorId, setAuthorId] = useState("");

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={() =>
          requestAction("create_discussion", (m) => {
            setAuthorId(m.id);
            setOpen(true);
          })
        }
      >
        <PenLine aria-hidden="true" /> {label}
      </Button>
      <DiscussionComposer
        open={open}
        onOpenChange={setOpen}
        authorId={authorId}
        onDone={(d) => goToThread && router.push(`/community/${d.id}`)}
      />
    </>
  );
}
