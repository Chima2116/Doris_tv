"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { DISCUSSION_CATEGORIES } from "@/data/mock/discussions";
import type { Discussion } from "@/data/types";
import { community } from "./community-store";

const schema = z.object({
  title: z.string().trim().min(8, "Give your discussion a clear title (at least 8 characters).").max(120, "Keep the title under 120 characters."),
  category: z.enum(DISCUSSION_CATEGORIES, { error: "Choose a category." }),
  body: z.string().trim().min(20, "Say a little more (at least 20 characters).").max(5000, "That's over the 5,000 character limit."),
});
type Values = z.infer<typeof schema>;

/**
 * Create or edit a discussion. Editing pre-populates the existing content.
 * `authorId` is supplied by the caller from the (simulated) signed-in member.
 */
export function DiscussionComposer({
  open,
  onOpenChange,
  authorId,
  discussion,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authorId: string;
  /** When provided, the composer edits this discussion. */
  discussion?: Discussion;
  onDone?: (d: Discussion) => void;
}) {
  const editing = !!discussion;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", body: "", category: undefined },
  });

  // Re-seed the form whenever the dialog opens (fresh for create, prepopulated for edit).
  useEffect(() => {
    if (open) {
      reset({
        title: discussion?.title ?? "",
        body: discussion?.body ?? "",
        category: (discussion?.category as Values["category"]) ?? undefined,
      });
    }
  }, [open, discussion, reset]);

  const bodyLen = (useWatch({ control, name: "body" }) ?? "").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <form
          noValidate
          className="grid gap-5"
          onSubmit={handleSubmit(async (v) => {
            await new Promise((r) => setTimeout(r, 600));
            if (editing && discussion) {
              community.editDiscussion(discussion.id, v);
              toast.success("Discussion updated");
              onDone?.({ ...discussion, ...v, editedAt: new Date().toISOString() });
            } else {
              const created = community.createDiscussion({ authorId, ...v });
              toast.success("Discussion published");
              onDone?.(created);
            }
            onOpenChange(false);
          })}
        >
          <DialogHeader>
            <DialogTitle>{editing ? "Edit discussion" : "Start a discussion"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Your changes will show an “edited” note so readers know."
                : "Be specific and generous. Critique the work, not the person."}
            </DialogDescription>
          </DialogHeader>
          <FormField id="dc-title" label="Title" error={errors.title?.message}>
            {(a) => <Input {...a} maxLength={140} {...register("title")} />}
          </FormField>
          <FormField id="dc-category" label="Category" error={errors.category?.message}>
            {(a) => (
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger {...a} className="h-11 w-full bg-surface" onBlur={field.onBlur}>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCUSSION_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
          <FormField id="dc-body" label="Your post" error={errors.body?.message} hint={`${bodyLen} / 5000`}>
            {(a) => <Textarea {...a} rows={7} {...register("body")} />}
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (editing ? "Saving…" : "Publishing…") : editing ? "Save changes" : "Publish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
