"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { useSession } from "@/features/auth/session-provider";
import { checkGate } from "@/lib/permissions";
import { community } from "./community-store";

const schema = z.object({
  body: z.string().trim().min(2, "Write a reply before posting.").max(3000, "Replies are limited to 3,000 characters."),
});

/**
 * Reply box. Guests and ineligible members can type; posting prompts them with what
 * they need to do, and the draft is kept so the reply posts after simulated sign-in.
 */
export function ReplyComposer({ discussionId }: { discussionId: string }) {
  const { user, requestAction } = useSession();
  const gate = checkGate(user, "reply");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { body: "" } });

  return (
    <form
      noValidate
      className="grid gap-3"
      onSubmit={handleSubmit(({ body }) =>
        requestAction("reply", (member) => {
          community.createReply({ discussionId, authorId: member.id, body });
          reset({ body: "" });
          toast.success("Reply posted");
        }),
      )}
    >
      <FormField id="reply-body" label="Add a reply" error={errors.body?.message}>
        {(a) => <Textarea {...a} rows={4} placeholder="Add to the conversation…" {...register("body")} />}
      </FormField>
      {!gate.allowed && (
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">{gate.title}.</strong> {gate.message}
        </p>
      )}
      <div>
        <Button type="submit">Post reply</Button>
      </div>
    </form>
  );
}
