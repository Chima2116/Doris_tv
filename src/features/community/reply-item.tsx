"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TimeAgo } from "@/components/shared/time-ago";
import type { Member, Reply } from "@/data/types";
import { AuthorChip } from "./author-chip";
import { community } from "./community-store";
import { ReactionButton } from "./reaction-button";
import { ReportButton } from "./report-button";

export function EditedNote({ at }: { at?: string }) {
  if (!at) return null;
  return (
    <span className="italic">
      · edited <TimeAgo iso={at} />
    </span>
  );
}

export function ReplyItem({ reply, author, canEdit }: { reply: Reply; author?: Member; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reply.body);
  const [error, setError] = useState<string | null>(null);

  if (reply.status === "hidden") {
    return (
      <li className="border-t border-border py-6 text-sm italic text-muted-foreground">
        This reply is hidden while moderators review it.
      </li>
    );
  }

  return (
    <li id={reply.id} className="border-t border-border py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AuthorChip member={author} size="sm" />
        <p className="text-xs text-muted-foreground">
          <TimeAgo iso={reply.createdAt} /> <EditedNote at={reply.editedAt} />
        </p>
      </div>

      {editing ? (
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim().length < 2) {
              setError("A reply can't be empty.");
              return;
            }
            community.editReply(reply.id, draft.trim());
            setEditing(false);
            setError(null);
            toast.success("Reply updated");
          }}
        >
          <label htmlFor={`edit-${reply.id}`} className="sr-only">
            Edit your reply
          </label>
          <Textarea
            id={`edit-${reply.id}`}
            rows={4}
            value={draft}
            aria-invalid={!!error}
            onChange={(e) => setDraft(e.target.value)}
          />
          {error && (
            <p role="alert" className="text-sm text-[#ee8585]">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(reply.body);
                setEditing(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-3 whitespace-pre-line leading-relaxed text-reading">{reply.body}</p>
      )}

      {!editing && (
        <div className="-ml-3 mt-3 flex flex-wrap items-center gap-1">
          <ReactionButton type="reply" id={reply.id} baseCount={reply.reactionCount} />
          {canEdit && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setEditing(true)}>
              <Pencil aria-hidden="true" /> Edit
            </Button>
          )}
          <ReportButton type="reply" id={reply.id} authorId={reply.authorId} />
        </div>
      )}
    </li>
  );
}
