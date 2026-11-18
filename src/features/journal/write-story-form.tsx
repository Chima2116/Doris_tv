"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/session-provider";
import { isVerifiedFilmmaker } from "@/lib/permissions";
import { JOURNAL_TYPES } from "./journal-types";
import { submitStory } from "./submit-story";
import { deleteDraft, loadDraft, newDraftId, saveDraft } from "./drafts";

const VIDEO_HOSTS = /(youtube\.com|youtu\.be|instagram\.com)/i;

const schema = z
  .object({
    title: z.string().trim().min(5, "Give the story a title of at least 5 characters.").max(120),
    type: z.enum(JOURNAL_TYPES.map((t) => t.value) as [string, ...string[]], { message: "Choose a type." }),
    excerpt: z.string().trim().max(280, "Keep the summary under 280 characters.").optional(),
    body: z.string().trim().min(200, "The story needs at least 200 characters."),
    coverImage: z
      .custom<FileList | undefined>()
      .optional()
      .refine((f) => !f || f.length === 0 || f[0].size <= 10 * 1024 * 1024, "The image must be under 10 MB."),
    coverCredit: z.string().trim().max(120).optional(),
    videoUrl: z.string().trim().optional(),
    confirmed: z.literal(true, { message: "Please confirm this is your own work." }),
  })
  .superRefine((v, ctx) => {
    if (v.type === "Video" && !(v.videoUrl && VIDEO_HOSTS.test(v.videoUrl))) {
      ctx.addIssue({ code: "custom", path: ["videoUrl"], message: "Add a YouTube or Instagram link for a video." });
    }
  });

type Values = z.infer<typeof schema>;

const field =
  "mt-2 w-full border border-white/20 bg-transparent px-3 py-2.5 text-reading placeholder:text-white/35 focus:border-gold focus:outline-none";
const label = "text-sm font-semibold text-reading";
const error = "mt-1.5 text-sm text-red-300";

export function WriteStoryForm({ draftId }: { draftId?: string }) {
  const { user } = useSession();
  const router = useRouter();
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);
  const idRef = useRef<string>(draftId ?? "");
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", type: "", excerpt: "", body: "", videoUrl: "", coverCredit: "", confirmed: undefined as unknown as true },
  });

  // Pick up a saved draft once the page is in the browser (drafts live in local storage).
  useEffect(() => {
    if (!draftId) return;
    const d = loadDraft(draftId);
    if (d) form.reset({ title: d.title, type: d.type, excerpt: d.excerpt, body: d.body, videoUrl: d.videoUrl, coverCredit: d.coverCredit, confirmed: undefined as unknown as true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  // Autosave: every change is kept as a draft, so an unfinished story is never lost.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sub = form.watch((v) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const hasContent = [v.title, v.excerpt, v.body, v.videoUrl, v.coverCredit].some((x) => (x ?? "").trim() !== "");
        if (!hasContent) return;
        if (!idRef.current) idRef.current = newDraftId();
        saveDraft({
          id: idRef.current,
          title: v.title ?? "",
          type: v.type ?? "",
          excerpt: v.excerpt ?? "",
          body: v.body ?? "",
          videoUrl: v.videoUrl ?? "",
          coverCredit: v.coverCredit ?? "",
          updatedAt: new Date().toISOString(),
        });
      }, 500);
    });
    return () => {
      clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [form]);

  if (!user || !isVerifiedFilmmaker(user)) {
    return (
      <EmptyState
        title="This area is for verified filmmakers"
        description="Apply for a filmmaker profile, and once it's approved you can write for the Journal here."
        action={{ label: "Apply for a profile", href: "/filmmaker-application" }}
      />
    );
  }

  if (submittedTitle) {
    return (
      <section aria-live="polite" className="border border-gold/40 bg-surface p-8 sm:p-10">
        <p className="tag text-gold">Sent for review</p>
        <h2 className="heading-feature mt-4 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight">Thank you. Your story is with the team.</h2>
        <p className="mt-4 max-w-xl text-reading/75">
          &ldquo;{submittedTitle}&rdquo; has been sent and is pending review. Our editors read every submission before it goes live. You&apos;ll hear from us once it has been reviewed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="gold" onClick={() => { setSubmittedTitle(null); form.reset(); }}>Write another story</Button>
          <Button variant="outline" asChild><a href="/filmmaker-dashboard/profile">Back to your profile</a></Button>
        </div>
      </section>
    );
  }

  const onSubmit = async (values: Values) => {
    const cover = values.coverImage?.[0];
    await submitStory({ title: values.title, type: values.type, excerpt: values.excerpt, body: values.body, videoUrl: values.videoUrl, coverImage: cover, coverCredit: values.coverCredit });
    if (idRef.current) deleteDraft(idRef.current);
    idRef.current = "";
    setSubmittedTitle(values.title);
  };

  const bodyLength = form.watch("body")?.trim().length ?? 0;
  const isVideo = form.watch("type") === "Video";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">
      <div>
        <label htmlFor="title" className={label}>Title</label>
        <input id="title" className={field} placeholder="The story in a sentence" {...form.register("title")} />
        {form.formState.errors.title && <p className={error}>{form.formState.errors.title.message}</p>}
      </div>

      <div>
        <p className={label}>Type of story</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {JOURNAL_TYPES.map((t) => (
            <label key={t.value} className="flex cursor-pointer items-start gap-3 border border-white/15 p-3 hover:border-gold/60 has-[:checked]:border-gold">
              <input type="radio" value={t.value} className="mt-1 accent-[var(--doris-gold)]" {...form.register("type")} />
              <span>
                <span className="block font-semibold text-reading">{t.label}</span>
                <span className="block text-sm text-reading/60">{t.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {form.formState.errors.type && <p className={error}>{form.formState.errors.type.message}</p>}
      </div>

      <div>
        <label htmlFor="excerpt" className={label}>Short summary <span className="font-normal text-reading/50">(optional, shown under the title)</span></label>
        <textarea id="excerpt" rows={2} className={field} {...form.register("excerpt")} />
        {form.formState.errors.excerpt && <p className={error}>{form.formState.errors.excerpt.message}</p>}
      </div>

      <div>
        <label htmlFor="coverImage" className={label}>Cover image <span className="font-normal text-reading/50">(optional, shown on the Journal)</span></label>
        <input id="coverImage" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm text-reading/80 file:mr-4 file:border file:border-white/20 file:bg-transparent file:px-4 file:py-2 file:text-reading" {...form.register("coverImage")} />
        <p className="mt-1.5 text-sm text-reading/50">JPG, PNG or WebP, up to 10 MB. Landscape works best.</p>
        {form.formState.errors.coverImage && <p className={error}>{String(form.formState.errors.coverImage.message)}</p>}
        <div className="mt-4">
          <label htmlFor="coverCredit" className={label}>Photo credit <span className="font-normal text-reading/50">(optional)</span></label>
          <input id="coverCredit" className={field} placeholder="Who took the photograph" {...form.register("coverCredit")} />
        </div>
      </div>

      {isVideo && (
        <div>
          <label htmlFor="videoUrl" className={label}>Video link</label>
          <input id="videoUrl" className={field} placeholder="https://www.youtube.com/watch?v=…" {...form.register("videoUrl")} />
          {form.formState.errors.videoUrl && <p className={error}>{form.formState.errors.videoUrl.message}</p>}
        </div>
      )}

      <div>
        <label htmlFor="body" className={label}>Your story</label>
        <textarea id="body" rows={14} className={`${field} leading-relaxed`} {...form.register("body")} />
        <p className="mt-1.5 text-sm text-reading/50">{bodyLength} characters. Separate paragraphs with a blank line.</p>
        {form.formState.errors.body && <p className={error}>{form.formState.errors.body.message}</p>}
      </div>

      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 accent-[var(--doris-gold)]" {...form.register("confirmed")} />
        <span className="text-sm text-reading/75">I confirm this is my own work, and I have the rights to any images or footage I use.</span>
      </label>
      {form.formState.errors.confirmed && <p className={error}>{form.formState.errors.confirmed.message}</p>}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Button type="submit" variant="gold" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send for review"}
        </Button>
        <p className="text-sm text-reading/55">Nothing goes live until our editors have reviewed it.</p>
        {draftId && (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto"
            onClick={() => {
              if (!window.confirm("Delete this draft? This can't be undone.")) return;
              deleteDraft(draftId);
              router.push("/write");
            }}
          >
            Delete draft
          </Button>
        )}
      </div>
      <p className="text-xs text-reading/45">Your draft is saved automatically as you write.</p>
    </form>
  );
}
