"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Eyebrow } from "@/components/shared/eyebrow";
import { FormField } from "@/components/shared/form-field";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { makeId } from "@/lib/persisted-store";
import type { Filmmaker, FilmmakerApplication, FilmmakerProfileFields } from "@/data/types";
import { COUNTRIES, CREDIT_FORMATS, DISCIPLINES } from "@/features/applications/application-constants";
import { approvedApplicationFor, useApplicationsState } from "@/features/applications/applications-store";
import { useSession } from "@/features/auth/session-provider";
import { isVerifiedFilmmaker } from "@/lib/permissions";
import { mergeRevisions, revisionsFor, revisionsStore, useRevisionsState } from "./revisions-store";
import { latestApprovedFields } from "./filmmaker-overlay";

const year = z.string().regex(/^(19|20)\d{2}$/, "Enter a four-digit year, such as 2018.");
const schema = z.object({
  name: z.string().trim().min(2, "Enter your professional name."),
  country: z.string().min(1, "Choose your country."),
  location: z.string().trim().max(60, "Keep this under 60 characters."),
  primaryDiscipline: z.string().min(1, "Choose your primary discipline."),
  yearsActive: z.string().trim().max(40, "Keep this under 40 characters."),
  biography: z.string().trim().min(80, "Your biography needs at least 80 characters.").max(2000, "Keep your biography under 2,000 characters."),
  creativePhilosophy: z.string().trim().max(300, "Keep this under 300 characters."),
  links: z.array(z.object({ label: z.string().trim().min(1, "Add a label."), url: z.url("Enter a full link starting with https://") })).max(5),
  credits: z.array(z.object({ title: z.string().trim().min(1, "Enter the title."), year, role: z.string().trim().min(1, "Enter your role."), format: z.string().min(1, "Choose a format.") })).min(1, "Keep at least one credit.").max(12),
});
type Values = z.infer<typeof schema>;

const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

const fromFields = (f: FilmmakerProfileFields): Values => ({
  name: f.name,
  country: f.country,
  location: f.location ?? "",
  primaryDiscipline: f.primaryDiscipline,
  yearsActive: f.yearsActive ?? "",
  biography: f.biography,
  creativePhilosophy: f.creativePhilosophy ?? "",
  links: f.links,
  credits: f.credits.map((c) => ({ title: c.title, year: String(c.year), role: c.role, format: c.format ?? "" })),
});

const toFields = (v: Values): FilmmakerProfileFields => ({
  name: v.name,
  country: v.country,
  location: v.location || undefined,
  primaryDiscipline: v.primaryDiscipline,
  yearsActive: v.yearsActive || undefined,
  biography: v.biography,
  creativePhilosophy: v.creativePhilosophy || undefined,
  links: v.links,
  credits: v.credits.map((c) => ({ id: makeId("c"), title: c.title, year: Number(c.year), role: c.role, format: c.format })),
});

/** The published profile: a seeded filmmaker, or one created by an approved application. */
function publishedFor(
  filmmakerId: string,
  seedFilmmakers: Filmmaker[],
  application?: FilmmakerApplication,
): { fields: FilmmakerProfileFields; slug?: string } | null {
  const f = seedFilmmakers.find((x) => x.id === filmmakerId);
  if (f) {
    return {
      slug: f.slug,
      fields: { name: f.name, country: f.country, location: f.location, primaryDiscipline: f.primaryDiscipline, biography: f.biography, creativePhilosophy: f.creativePhilosophy, yearsActive: f.yearsActive, credits: f.credits, links: f.links },
    };
  }
  if (application) {
    const d = application.details;
    return {
      fields: {
        name: d.fullName,
        country: d.country,
        location: d.city,
        primaryDiscipline: d.primaryDiscipline,
        biography: d.biography,
        creativePhilosophy: d.creativePhilosophy,
        yearsActive: d.yearsActive,
        credits: d.credits,
        links: d.links,
      },
    };
  }
  return null;
}

export function ProfileEditor({ seedFilmmakers }: { seedFilmmakers: Filmmaker[]; seedApplications?: FilmmakerApplication[] }) {
  const { user } = useSession();
  const hydrated = useHydrated();
  const appsState = useApplicationsState();

  if (!hydrated) return <div className="h-96 animate-pulse bg-surface" aria-hidden="true" />;

  if (!user || !isVerifiedFilmmaker(user) || !user.filmmakerId) {
    return (
      <EmptyState
        title="This area is for verified filmmakers"
        description="Apply for a filmmaker profile, and once it's approved you'll manage it here."
        action={{ label: "Apply for a profile", href: "/filmmaker-application" }}
      />
    );
  }

  const approved = approvedApplicationFor(user.id, appsState);
  const published = publishedFor(user.filmmakerId, seedFilmmakers, approved);
  if (!published) {
    return <EmptyState title="We couldn't find your profile" description="Please contact the DORIS TV team." />;
  }

  return <Editor key={user.filmmakerId} filmmakerId={user.filmmakerId} published={published.fields} slug={published.slug} />;
}

function Editor({ filmmakerId, published, slug }: { filmmakerId: string; published: FilmmakerProfileFields; slug?: string }) {
  const revState = useRevisionsState();
  const all = mergeRevisions(revState);
  const history = revisionsFor(filmmakerId, all);
  // The published profile includes any previously approved revisions.
  const livePublished = latestApprovedFields(filmmakerId, all) ?? published;
  const pending = history.find((r) => r.status === "pending");
  const lastDecided = history.find((r) => r.status !== "pending");
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    // Start from the pending proposal if there is one, otherwise from the published profile.
    defaultValues: fromFields(pending?.proposed ?? livePublished),
  });
  const { register, control, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = form;
  const links = useFieldArray({ control, name: "links" });
  const credits = useFieldArray({ control, name: "credits" });
  const preview = useWatch({ control });

  return (
    <div>
      {pending ? (
        <div role="status" className="mb-8 flex flex-wrap items-start justify-between gap-4 border border-warning/50 bg-warning/5 p-5">
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <p className="flex flex-wrap items-center gap-3 font-semibold">
                Awaiting administrator approval <StatusBadge status="pending" />
              </p>
              <p className="mt-1 max-w-xl text-sm text-reading/75">
                Submitted {formatDate(pending.submittedAt)}. Your public profile still shows the
                published version until an administrator approves these changes.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setWithdrawOpen(true)}>
            Withdraw revision
          </Button>
        </div>
      ) : (
        <p role="note" className="mb-8 border border-border p-5 text-sm text-reading/75">
          Changes you save are sent for administrator approval before they appear publicly. Your
          published profile{slug && <> (<Link className="text-gold underline" href={`/filmmakers/${slug}`}>view it</Link>)</>} stays as it is until then.
        </p>
      )}
      {!pending && lastDecided?.status === "rejected" && (
        <blockquote className="mb-8 border-l-4 border-danger pl-4 text-sm text-reading/85">
          <p className="type-eyebrow mb-1 text-[#ee8585]">Your last revision wasn&apos;t approved</p>
          {lastDecided.decisionReason ?? "No reason was given."}
        </blockquote>
      )}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <form
          noValidate
          className="grid min-w-0 gap-6"
          onSubmit={handleSubmit(async (v) => {
            await new Promise((r) => setTimeout(r, 600));
            revisionsStore.submit(filmmakerId, toFields(v));
            reset(v);
            toast.success("Revision submitted for review");
          })}
        >
          <FormField id="pe-name" label="Professional name" error={errors.name?.message}>
            {(a) => <Input {...a} {...register("name")} />}
          </FormField>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField id="pe-country" label="Country" error={errors.country?.message}>
              {(a) => (
                <Controller control={control} name="country" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger {...a} className="h-11 w-full bg-surface"><SelectValue /></SelectTrigger>
                    <SelectContent>{[...new Set([published.country, ...COUNTRIES])].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              )}
            </FormField>
            <FormField id="pe-location" label="City" optional error={errors.location?.message}>
              {(a) => <Input {...a} {...register("location")} />}
            </FormField>
            <FormField id="pe-discipline" label="Primary discipline" error={errors.primaryDiscipline?.message}>
              {(a) => (
                <Controller control={control} name="primaryDiscipline" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger {...a} className="h-11 w-full bg-surface"><SelectValue /></SelectTrigger>
                    <SelectContent>{DISCIPLINES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              )}
            </FormField>
            <FormField id="pe-years" label="Years active" optional hint="e.g. 2016 – present" error={errors.yearsActive?.message}>
              {(a) => <Input {...a} {...register("yearsActive")} />}
            </FormField>
          </div>
          <FormField id="pe-bio" label="Biography" hint="Separate paragraphs with a blank line." error={errors.biography?.message}>
            {(a) => <Textarea {...a} rows={9} {...register("biography")} />}
          </FormField>
          <FormField id="pe-phil" label="Creative philosophy" optional error={errors.creativePhilosophy?.message}>
            {(a) => <Textarea {...a} rows={3} {...register("creativePhilosophy")} />}
          </FormField>

          <fieldset className="grid gap-4">
            <legend className="mb-1 text-sm font-semibold">External links</legend>
            {links.fields.map((f, i) => (
              <div key={f.id} className="grid gap-3 sm:grid-cols-[9rem_1fr_auto] sm:items-start">
                <FormField id={`pe-ll-${i}`} label="Label" error={errors.links?.[i]?.label?.message}>
                  {(a) => <Input {...a} {...register(`links.${i}.label`)} />}
                </FormField>
                <FormField id={`pe-lu-${i}`} label="Link" error={errors.links?.[i]?.url?.message}>
                  {(a) => <Input {...a} type="url" {...register(`links.${i}.url`)} />}
                </FormField>
                <Button type="button" variant="ghost" size="icon" className="sm:mt-7" aria-label={`Remove link ${i + 1}`} onClick={() => links.remove(i)}><Trash2 /></Button>
              </div>
            ))}
            {links.fields.length < 5 && (
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => links.append({ label: "", url: "" })}><Plus aria-hidden="true" /> Add a link</Button>
            )}
          </fieldset>

          <fieldset className="grid gap-4">
            <legend className="mb-1 text-sm font-semibold">Professional credits</legend>
            {credits.fields.map((f, i) => (
              <div key={f.id} className="grid gap-3 border border-border p-4 sm:grid-cols-2">
                <FormField id={`pe-ct-${i}`} label="Title" className="sm:col-span-2" error={errors.credits?.[i]?.title?.message}>
                  {(a) => <Input {...a} {...register(`credits.${i}.title`)} />}
                </FormField>
                <FormField id={`pe-cy-${i}`} label="Year" error={errors.credits?.[i]?.year?.message}>
                  {(a) => <Input {...a} inputMode="numeric" maxLength={4} {...register(`credits.${i}.year`)} />}
                </FormField>
                <FormField id={`pe-cr-${i}`} label="Your role" error={errors.credits?.[i]?.role?.message}>
                  {(a) => <Input {...a} {...register(`credits.${i}.role`)} />}
                </FormField>
                <FormField id={`pe-cf-${i}`} label="Format" error={errors.credits?.[i]?.format?.message}>
                  {(a) => (
                    <Controller control={control} name={`credits.${i}.format`} render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger {...a} className="h-11 w-full bg-surface"><SelectValue placeholder="Choose" /></SelectTrigger>
                        <SelectContent>{[...new Set([...(field.value ? [field.value] : []), ...CREDIT_FORMATS])].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                  )}
                </FormField>
                {credits.fields.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" className="w-fit self-end" onClick={() => credits.remove(i)}><Trash2 aria-hidden="true" /> Remove credit</Button>
                )}
              </div>
            ))}
            {errors.credits?.root?.message && <p role="alert" className="text-sm text-[#ee8585]">{errors.credits.root.message}</p>}
            {credits.fields.length < 12 && (
              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => credits.append({ title: "", year: "", role: "", format: "" })}><Plus aria-hidden="true" /> Add a credit</Button>
            )}
          </fieldset>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Saving…" : pending ? "Update pending revision" : "Save revision for review"}
            </Button>
            {isDirty && (
              <Button type="button" variant="ghost" onClick={() => reset(fromFields(pending?.proposed ?? livePublished))}>
                Discard edits
              </Button>
            )}
          </div>
        </form>

        <aside aria-label="Profile preview" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <Eyebrow>Profile preview</Eyebrow>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">How your profile would look. Not live until approved.</p>
          <div className="border border-border bg-surface p-6">
            <p className="type-eyebrow text-gold">{preview.primaryDiscipline || "Discipline"}</p>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight">{preview.name || "Your name"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {[preview.location, preview.country].filter(Boolean).join(", ")}
              {preview.yearsActive ? ` · ${preview.yearsActive}` : ""}
            </p>
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-reading/80">
              {(preview.biography ?? "").split(/\n{2,}/).filter(Boolean).slice(0, 3).map((p, i) => <p key={i} className="line-clamp-6">{p}</p>)}
            </div>
            {preview.creativePhilosophy && (
              <blockquote className="mt-5 border-l-4 border-gold pl-4 font-display text-lg font-black leading-snug">“{preview.creativePhilosophy}”</blockquote>
            )}
            <h3 className="type-eyebrow mt-6 font-sans text-muted-foreground">Credits</h3>
            <ul className="mt-2 divide-y divide-border border-y border-border text-sm">
              {(preview.credits ?? []).filter((c) => c?.title).map((c, i) => (
                <li key={i} className="flex justify-between gap-4 py-2">
                  <span><span className="font-semibold">{c.title}</span> <span className="text-muted-foreground">{c.role}</span></span>
                  <span className="text-muted-foreground">{c.year}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {history.length > 0 && (
        <section aria-labelledby="rev-history" className="mt-16">
          <h2 id="rev-history" className="type-eyebrow mb-4 font-sans text-gold">Revision history</h2>
          <ul className="divide-y divide-border border-y border-border">
            {history.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={r.status} />
                  <span className="text-sm text-muted-foreground">Submitted {formatDate(r.submittedAt)}</span>
                  {r.decidedAt && <span className="text-sm text-muted-foreground">· Decided {formatDate(r.decidedAt)}</span>}
                </div>
                {r.decisionReason && <p className="mt-2 max-w-2xl text-sm text-reading/70">{r.decisionReason}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        title="Withdraw this revision?"
        description="Your proposed changes will be discarded. Your published profile isn't affected."
        confirmLabel="Withdraw revision"
        destructive
        onConfirm={() => {
          if (pending) revisionsStore.withdraw(pending.id);
          reset(fromFields(livePublished));
          toast.success("Revision withdrawn");
        }}
      />
    </div>
  );
}
