"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ArticleBlock, ArticleStatus, JournalArticle, JournalCategory } from "@/data/types";
import { ArticleBody } from "@/features/journal/article-body";
import { slugify } from "@/features/filmmakers/filmmaker-overlay";
import { auditStore, cmsStore, mergeArticles, useCmsState } from "./admin-stores";
import { AdminPageHeader, AdminSkeleton, AdminTable, DetailSheet, FilterBar, FilterSelect, PrototypeNote, SearchBox, StatCard, Td, Th, fmt, useAdminReady } from "./ui";

const CATEGORIES: JournalCategory[] = ["Interview", "Essay", "Production Notes", "Retrospective", "Video"];

/** Lightweight body markup: "## Heading", "> Quote — Cite", "![Alt](Caption)", blank-line separated paragraphs. */
export function parseBody(text: string): ArticleBlock[] {
  return text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b): ArticleBlock => {
      if (b.startsWith("## ")) return { type: "h2", text: b.slice(3).trim() };
      if (b.startsWith("> ")) {
        const [t, cite] = b.slice(2).split(/\s+—\s+/);
        return { type: "quote", text: t.trim(), cite: cite?.trim() };
      }
      const img = b.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (img) return { type: "image", alt: img[1], caption: img[2] || undefined };
      return { type: "p", text: b };
    });
}
const blocksToText = (blocks: ArticleBlock[] = []) =>
  blocks.map((b) => (b.type === "h2" ? `## ${b.text}` : b.type === "quote" ? `> ${b.text}${b.cite ? ` — ${b.cite}` : ""}` : b.type === "image" ? `![${b.alt}](${b.caption ?? ""})` : b.text)).join("\n\n");

const schema = z.object({
  title: z.string().trim().min(5, "Give the story a title (at least 5 characters)."),
  slug: z.string().trim().min(3, "A slug is required.").regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens."),
  deck: z.string().trim().max(300, "Keep the deck under 300 characters."),
  author: z.string().trim().min(2, "Enter the author's name."),
  category: z.enum(CATEGORIES, { error: "Choose a category." }),
  readingTime: z.string().regex(/^\d{1,2}$/, "Enter minutes, e.g. 8."),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  status: z.enum(["draft", "scheduled", "published"]),
  featured: z.boolean(),
  body: z.string().trim().min(20, "Write at least a short body (20 characters)."),
  videoUrl: z.string().trim().pipe(z.union([z.literal(""), z.url("Enter a full link starting with https://")])),
});
type Values = z.infer<typeof schema>;

function Editor({ article, existingSlugs, onSaved }: { article?: JournalArticle; existingSlugs: string[]; onSaved: () => void }) {
  const { actor } = useAdminReady();
  const [slugTouched, setSlugTouched] = useState(!!article);
  const { register, control, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      deck: article?.deck ?? "",
      author: article?.author ?? "",
      category: article?.category,
      readingTime: String(article?.readingTime ?? 6),
      publishedAt: article?.publishedAt ?? "2026-11-12",
      status: article?.status ?? "draft",
      featured: article?.featured ?? false,
      body: blocksToText(article?.body),
      videoUrl: article?.video?.url ?? "",
    },
  });
  const live = useWatch({ control });

  return (
    <form
      id="article-form"
      noValidate
      onSubmit={handleSubmit(async (v) => {
        if (existingSlugs.includes(v.slug) && v.slug !== article?.slug) {
          setError("slug", { message: "That slug is already used by another story." });
          return;
        }
        await new Promise((r) => setTimeout(r, 400));
        const data: Omit<JournalArticle, "id"> = {
          slug: v.slug, title: v.title, deck: v.deck || undefined, coverImage: article?.coverImage ?? "",
          coverAlt: article?.coverAlt ?? v.title, category: v.category, author: v.author, authorBio: article?.authorBio,
          publishedAt: v.publishedAt, readingTime: Number(v.readingTime), featured: v.featured, status: v.status as ArticleStatus,
          body: parseBody(v.body), filmmakerSlugs: article?.filmmakerSlugs,
          video: v.category === "Video" ? { platform: article?.video?.platform ?? "YouTube", url: v.videoUrl || "https://www.youtube.com/", runtimeMinutes: Number(v.readingTime) } : undefined,
        };
        if (article) cmsStore.patch(article.id, data);
        else cmsStore.create(data);
        if (actor) auditStore.log(actor, article ? "article.updated" : "article.created", `"${v.title}" ${article ? "updated" : "created"} (${v.status})`);
        toast.success(article ? "Story updated" : "Story created");
        onSaved();
      })}
    >
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="grid gap-5">
          <FormField id="ar-title" label="Title" error={errors.title?.message}>
            {(a) => <Input {...a} {...register("title", { onChange: (e) => { if (!slugTouched) setValue("slug", slugify(e.target.value)); } })} />}
          </FormField>
          <FormField id="ar-slug" label="Slug" hint="Generated from the title; edit if needed." error={errors.slug?.message}>
            {(a) => <Input {...a} {...register("slug", { onChange: () => setSlugTouched(true) })} />}
          </FormField>
          <FormField id="ar-deck" label="Deck" optional error={errors.deck?.message}>
            {(a) => <Textarea {...a} rows={2} {...register("deck")} />}
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="ar-author" label="Author" error={errors.author?.message}>{(a) => <Input {...a} {...register("author")} />}</FormField>
            <FormField id="ar-cat" label="Category" error={errors.category?.message}>
              {(a) => (
                <Controller control={control} name="category" render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger {...a} className="h-11 w-full bg-surface"><SelectValue placeholder="Choose" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              )}
            </FormField>
            <FormField id="ar-time" label="Reading / watch time (min)" error={errors.readingTime?.message}>{(a) => <Input {...a} inputMode="numeric" {...register("readingTime")} />}</FormField>
            <FormField id="ar-date" label="Publish date" error={errors.publishedAt?.message}>{(a) => <Input {...a} type="date" {...register("publishedAt")} />}</FormField>
            <FormField id="ar-status" label="Status">
              {(a) => (
                <Controller control={control} name="status" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger {...a} className="h-11 w-full bg-surface"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
                  </Select>
                )} />
              )}
            </FormField>
            <div className="flex items-end gap-3 pb-3">
              <Controller control={control} name="featured" render={({ field }) => <Checkbox id="ar-featured" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />} />
              <Label htmlFor="ar-featured" className="font-normal">Feature as the cover story</Label>
            </div>
          </div>
          {live.category === "Video" && (
            <FormField id="ar-video" label="Video link" optional hint="Video conversations link out to YouTube or Instagram." error={errors.videoUrl?.message}>
              {(a) => <Input {...a} type="url" placeholder="https://" {...register("videoUrl")} />}
            </FormField>
          )}
          <FormField id="ar-body" label="Body" hint={'Blank line between paragraphs. "## " for a heading, "> " for a pull quote (add " — Name" to credit).'} error={errors.body?.message}>
            {(a) => <Textarea {...a} rows={14} className="font-mono text-sm" {...register("body")} />}
          </FormField>
        </TabsContent>
        <TabsContent value="preview">
          <p className="type-eyebrow text-gold">{live.category ?? "Category"}</p>
          <h3 className="mt-3 font-display text-3xl font-black leading-tight">{live.title || "Untitled story"}</h3>
          {live.deck && <p className="mt-3 text-reading/70">{live.deck}</p>}
          <p className="mt-3 text-xs text-muted-foreground">By {live.author || "Author"} · {live.readingTime || "—"} min</p>
          <div className="mt-8"><ArticleBody blocks={parseBody(live.body ?? "")} /></div>
        </TabsContent>
      </Tabs>
      <button type="submit" className="hidden" disabled={isSubmitting} aria-hidden="true" tabIndex={-1} />
    </form>
  );
}

export function JournalAdmin() {
  const { ready, actor } = useAdminReady();
  const params = useSearchParams();
  const cms = useCmsState();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<string | "new" | null>(params.get("new") ? "new" : null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  if (!ready || !actor) return <AdminSkeleton />;

  const all = mergeArticles(cms);
  const rows = all
    .filter((a) => (status === "all" ? true : a.status === status))
    .filter((a) => (category === "all" ? true : a.category === category))
    .filter((a) => !q.trim() || `${a.title} ${a.author}`.toLowerCase().includes(q.trim().toLowerCase()));
  const editArticle = editing && editing !== "new" ? all.find((a) => a.id === editing) : undefined;
  const preview = all.find((a) => a.id === previewId);

  const setStatusFor = (a: JournalArticle, s: ArticleStatus, verb: string) => {
    cmsStore.patch(a.id, { status: s });
    auditStore.log(actor, `article.${s}`, `"${a.title}" ${verb}`);
    toast.success(`${verb}`);
  };

  return (
    <div>
      <AdminPageHeader title="Journal" description="Create, edit and publish stories." actions={<Button size="sm" onClick={() => setEditing("new")}><Plus aria-hidden="true" /> New story</Button>} />
      <PrototypeNote>Simulation: changes are saved in this admin session and don&apos;t change the public Journal. There&apos;s no external CMS in Stage 1.</PrototypeNote>

      <section aria-label="Categories" className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((c) => <StatCard key={c} label={c} value={all.filter((a) => a.category === c).length} hint={`${all.filter((a) => a.category === c && a.status === "published").length} published`} />)}
      </section>

      <FilterBar>
        <SearchBox value={q} onChange={setQ} label="Search stories" placeholder="Search title or author" />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, { value: "published", label: "Published" }, { value: "scheduled", label: "Scheduled" }, { value: "draft", label: "Draft" }]} />
        <FilterSelect label="Category" value={category} onChange={setCategory} options={[{ value: "all", label: "All categories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} />
        <p className="ml-auto text-sm text-muted-foreground" role="status" aria-live="polite">{rows.length} {rows.length === 1 ? "story" : "stories"}</p>
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No stories match" description="Try a different search or filter, or write a new story." action={{ label: "Clear filters", onClick: () => { setQ(""); setStatus("all"); setCategory("all"); } }} />
      ) : (
        <AdminTable caption="Journal stories" minWidth="min-w-[56rem]">
          <thead><tr><Th>Title</Th><Th>Category</Th><Th>Author</Th><Th>Date</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-white/[0.02]">
                <Td className="max-w-sm"><span className="line-clamp-2 font-semibold">{a.title}</span><span className="block text-xs text-muted-foreground">/{a.slug}</span></Td>
                <Td>{a.category}</Td>
                <Td>{a.author}</Td>
                <Td className="whitespace-nowrap text-muted-foreground">{fmt(a.publishedAt)}</Td>
                <Td><StatusBadge status={a.status} /></Td>
                <Td className="text-right">
                  <span className="inline-flex flex-wrap justify-end gap-1.5">
                    <Button size="xs" variant="outline" onClick={() => setEditing(a.id)}>Edit</Button>
                    <Button size="xs" variant="ghost" onClick={() => setPreviewId(a.id)}>Preview</Button>
                    {a.status === "published" ? (
                      <Button size="xs" variant="ghost" onClick={() => setStatusFor(a, "draft", `"${a.title}" unpublished`)}>Unpublish</Button>
                    ) : (
                      <Button size="xs" onClick={() => setStatusFor(a, "published", `"${a.title}" published`)}>Publish</Button>
                    )}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <DetailSheet
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "New story" : "Edit story"}
        description="Changes are saved to this session's simulation."
        footer={<><Button type="submit" form="article-form">Save story</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></>}
      >
        {editing !== null && (
          <Editor key={editing} article={editArticle} existingSlugs={all.map((a) => a.slug)} onSaved={() => setEditing(null)} />
        )}
      </DetailSheet>

      <DetailSheet open={!!preview} onOpenChange={(o) => !o && setPreviewId(null)} title="Preview" description="How the story would read.">
        {preview && (
          <>
            <p className="type-eyebrow text-gold">{preview.category}</p>
            <h3 className="mt-3 font-display text-3xl font-black leading-tight">{preview.title}</h3>
            {preview.deck && <p className="mt-3 text-reading/70">{preview.deck}</p>}
            <p className="mt-3 text-xs text-muted-foreground">By {preview.author} · {fmt(preview.publishedAt)} · {preview.readingTime} min</p>
            <div className="mt-8">{preview.body && <ArticleBody blocks={preview.body} />}</div>
          </>
        )}
      </DetailSheet>
    </div>
  );
}
