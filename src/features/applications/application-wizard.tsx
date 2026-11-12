"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ApplicationDetails, FilmmakerApplication } from "@/data/types";
import { useSession } from "@/features/auth/session-provider";
import { checkGate, isVerifiedFilmmaker } from "@/lib/permissions";
import { makeId } from "@/lib/persisted-store";
import { cn } from "@/lib/utils";
import { COUNTRIES, CREDIT_FORMATS, DISCIPLINES } from "./application-constants";
import { applicationsFor, applicationsStore, emptyDetails, mergeApplications, useApplicationsState } from "./applications-store";

const year = z.string().regex(/^(19|20)\d{2}$/, "Enter a four-digit year, such as 2018.");
const url = z.string().trim().pipe(z.union([z.literal(""), z.url("Enter a full link starting with https://")]));

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address."),
  country: z.string().min(1, "Choose your country."),
  city: z.string().trim().max(60, "Keep this under 60 characters."),
  primaryDiscipline: z.string().min(1, "Choose your primary discipline."),
  activeFrom: year,
  biography: z.string().trim().min(80, "Tell us a little more (at least 80 characters).").max(1500, "Keep your biography under 1,500 characters."),
  creativeBackground: z.string().trim().max(1000, "Keep this under 1,000 characters."),
  creativePhilosophy: z.string().trim().max(300, "Keep this under 300 characters."),
  portfolioUrl: url,
  links: z.array(z.object({ label: z.string().trim().min(1, "Add a label, e.g. Instagram."), url: z.url("Enter a full link starting with https://") })).max(4),
  credits: z
    .array(z.object({ title: z.string().trim().min(1, "Enter the title."), year, role: z.string().trim().min(1, "Enter your role."), format: z.string().min(1, "Choose a format.") }))
    .min(1, "Add at least one professional credit.")
    .max(8, "You can add up to 8 credits for now."),
  confirm: z.boolean().refine((v) => v, "Please confirm before submitting."),
});
type Values = z.infer<typeof schema>;

const STEPS = [
  { title: "Applicant identity", fields: ["fullName", "email", "country", "city"] },
  { title: "Professional identity", fields: ["primaryDiscipline", "activeFrom"] },
  { title: "Biography and background", fields: ["biography", "creativeBackground", "creativePhilosophy"] },
  { title: "Portfolio and credits", fields: ["portfolioUrl", "links", "credits"] },
  { title: "Review and submit", fields: ["confirm"] },
] as const satisfies readonly { title: string; fields: readonly (keyof Values)[] }[];

const toValues = (d: ApplicationDetails, fallbackName: string): Values => ({
  fullName: d.fullName || fallbackName,
  email: d.email,
  country: d.country,
  city: d.city ?? "",
  primaryDiscipline: d.primaryDiscipline,
  activeFrom: d.yearsActive?.match(/\d{4}/)?.[0] ?? "",
  biography: d.biography,
  creativeBackground: d.creativeBackground ?? "",
  creativePhilosophy: d.creativePhilosophy ?? "",
  portfolioUrl: d.portfolioUrl ?? "",
  links: d.links,
  credits: d.credits.length ? d.credits.map((c) => ({ title: c.title, year: String(c.year), role: c.role, format: c.format ?? "" })) : [{ title: "", year: "", role: "", format: "" }],
  confirm: false,
});

const toDetails = (v: Partial<Values>): ApplicationDetails => ({
  fullName: v.fullName ?? "",
  email: v.email ?? "",
  country: v.country ?? "",
  city: v.city || undefined,
  primaryDiscipline: v.primaryDiscipline ?? "",
  yearsActive: v.activeFrom ? `${v.activeFrom} – present` : undefined,
  biography: v.biography ?? "",
  creativeBackground: v.creativeBackground || undefined,
  creativePhilosophy: v.creativePhilosophy || undefined,
  portfolioUrl: v.portfolioUrl || undefined,
  links: (v.links ?? []).filter((l) => l?.url),
  credits: (v.credits ?? []).filter((c) => c?.title).map((c) => ({ id: makeId("c"), title: c.title, year: Number(c.year) || 0, role: c.role, format: c.format || undefined })),
});

const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

/* ───────────────────────── Outer: eligibility and routing ───────────────────────── */
export function ApplicationWizard({ seed }: { seed: FilmmakerApplication[] }) {
  const { user } = useSession();
  const hydrated = useHydrated();
  const state = useApplicationsState();
  const [begun, setBegun] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  if (!hydrated) return <div className="h-96 animate-pulse bg-surface" aria-hidden="true" />;
  if (justSubmitted) return <SubmittedPanel />;

  const gate = checkGate(user, "apply_filmmaker");
  if (!gate.allowed) {
    return (
      <EmptyState
        title={gate.title}
        description={`${gate.message} Filmmaker applications are open to signed-in members on the waitlist.`}
        action={{ label: gate.cta.label, href: gate.cta.href }}
      />
    );
  }
  if (!user) return null;

  if (isVerifiedFilmmaker(user)) {
    return (
      <EmptyState
        title="You already have a filmmaker profile"
        description="Manage your public profile from your filmmaker dashboard. Changes are reviewed by our team before they go live."
        action={{ label: "Open your dashboard", href: "/filmmaker-dashboard/profile" }}
      />
    );
  }

  const mine = applicationsFor(user.id, mergeApplications(seed, state));
  const current = mine[0];

  if (current && (current.status === "submitted" || current.status === "under_review" || current.status === "approved")) {
    return (
      <div className="border border-border bg-surface p-8">
        <StatusBadge status={current.status} />
        <h2 className="mt-4 font-display text-2xl font-black">
          {current.status === "approved" ? "Your application was approved" : "Your application is in review"}
        </h2>
        <p className="mt-2 max-w-lg text-muted-foreground">You can follow its progress on the status page. We&apos;ll keep your details safe until a decision is made.</p>
        <Button asChild className="mt-6">
          <Link href="/filmmaker-application/status">View application status</Link>
        </Button>
      </div>
    );
  }

  if (current?.status === "rejected" && !begun) {
    return (
      <div className="border border-border bg-surface p-8">
        <StatusBadge status="rejected" />
        <h2 className="mt-4 font-display text-2xl font-black">Your previous application wasn&apos;t approved</h2>
        {current.decisionReason && <p className="mt-3 max-w-2xl text-reading/80">{current.decisionReason}</p>}
        <p className="mt-3 text-sm text-muted-foreground">You can apply again at any time. Your earlier application stays on record.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              applicationsStore.startNew(user.id, { ...current.details, credits: current.details.credits });
              setBegun(true);
            }}
          >
            Start a new application
          </Button>
          <Button asChild variant="ghost">
            <Link href="/filmmaker-application/status">View history</Link>
          </Button>
        </div>
      </div>
    );
  }

  const draft = current?.status === "draft" ? current : undefined;
  return <WizardForm userId={user.id} userName={user.displayName} draft={draft} onSubmitted={() => setJustSubmitted(true)} />;
}

function SubmittedPanel() {
  return (
    <div role="status" className="border border-success/40 bg-success/5 p-8 sm:p-10">
        <CheckCircle2 className="size-10 text-[#6fd09b]" aria-hidden="true" />
        <h2 className="mt-4 font-display text-3xl font-black">Application submitted</h2>
        <p className="mt-3 max-w-xl text-reading/80">
          Thank you. Our team will review your application. You can follow its progress at any time,
          and we&apos;ll update the status as it moves through review.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Prototype: nothing is sent to a server, and no decision is made automatically.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/filmmaker-application/status">View application status</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to DORIS TV</Link>
          </Button>
        </div>
      </div>
  );
}

/* ───────────────────────── Inner: the multi-step form ───────────────────────── */
function WizardForm({ userId, userName, draft, onSubmitted }: { userId: string; userName: string; draft?: FilmmakerApplication; onSubmitted: () => void }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [draftId, setDraftId] = useState(draft?.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: toValues(draft?.details ?? emptyDetails(), userName),
  });
  const { register, control, trigger, getValues, handleSubmit, formState: { errors } } = form;
  const links = useFieldArray({ control, name: "links" });
  const credits = useFieldArray({ control, name: "credits" });
  const all = useWatch({ control });

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const persist = () => {
    const id = applicationsStore.saveDraft(userId, toDetails(getValues()), draftId);
    setDraftId(id);
    return id;
  };

  const next = async () => {
    if (!(await trigger([...STEPS[step].fields]))) return;
    persist();
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    const id = persist();
    // Read back the merged application so the timeline keeps its draft event.
    const base: FilmmakerApplication = {
      id,
      applicantId: userId,
      createdAt: new Date().toISOString(),
      status: "draft",
      details: toDetails(getValues()),
      history: [{ status: "draft", at: new Date().toISOString() }],
    };
    const existing = applicationsStore.getSnapshot();
    const merged = [...existing.created].find((a) => a.id === id) ?? base;
    applicationsStore.setStatus({ ...merged, ...existing.patches[id] }, "submitted");
    setSubmitting(false);
    onSubmitted();
    window.scrollTo({ top: 0 });
  };

  const motionProps = reduce ? {} : { initial: { opacity: 0, x: 14 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.2 } };

  return (
    <div>
      <nav aria-label="Application progress" className="mb-10">
        <p className="type-eyebrow mb-3 text-muted-foreground" aria-live="polite">
          Step {step + 1} of {STEPS.length}
        </p>
        <ol className="grid grid-cols-5 gap-1.5">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <div className={cn("h-1.5", i <= step ? "bg-gold" : "bg-border")} aria-hidden="true" />
              <span className={cn("mt-2 hidden text-[0.7rem] font-semibold uppercase tracking-[0.06em] sm:block", i === step ? "text-gold" : "text-muted-foreground")} aria-current={i === step ? "step" : undefined}>
                {s.title}
              </span>
              <span className="sr-only sm:hidden">{s.title}</span>
            </li>
          ))}
        </ol>
      </nav>

      <form noValidate onSubmit={(e) => e.preventDefault()}>
        <motion.div key={step} {...motionProps} className="grid gap-6">
          <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-black outline-none">
            {STEPS[step].title}
          </h2>

          {step === 0 && (
            <>
              <FormField id="ap-name" label="Full name" error={errors.fullName?.message}>
                {(a) => <Input {...a} autoComplete="name" {...register("fullName")} />}
              </FormField>
              <FormField id="ap-email" label="Email address" hint="Use the email you joined the waitlist with." error={errors.email?.message}>
                {(a) => <Input {...a} type="email" autoComplete="email" {...register("email")} />}
              </FormField>
              <FormField id="ap-country" label="Country" error={errors.country?.message}>
                {(a) => (
                  <Controller control={control} name="country" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger {...a} className="h-11 w-full bg-surface"><SelectValue placeholder="Choose a country" /></SelectTrigger>
                      <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                )}
              </FormField>
              <FormField id="ap-city" label="City" optional error={errors.city?.message}>
                {(a) => <Input {...a} {...register("city")} />}
              </FormField>
            </>
          )}

          {step === 1 && (
            <>
              <FormField id="ap-discipline" label="Primary discipline" error={errors.primaryDiscipline?.message}>
                {(a) => (
                  <Controller control={control} name="primaryDiscipline" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger {...a} className="h-11 w-full bg-surface"><SelectValue placeholder="Choose a discipline" /></SelectTrigger>
                      <SelectContent>{DISCIPLINES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                )}
              </FormField>
              <FormField id="ap-active" label="Year you started working professionally" hint="For example 2016." error={errors.activeFrom?.message}>
                {(a) => <Input {...a} inputMode="numeric" maxLength={4} className="max-w-40" {...register("activeFrom")} />}
              </FormField>
            </>
          )}

          {step === 2 && (
            <>
              <FormField id="ap-bio" label="Biography" hint="Written in the third person, as it would appear on your profile. At least 80 characters." error={errors.biography?.message}>
                {(a) => <Textarea {...a} rows={7} {...register("biography")} />}
              </FormField>
              <FormField id="ap-bg" label="Creative background" optional error={errors.creativeBackground?.message}>
                {(a) => <Textarea {...a} rows={4} {...register("creativeBackground")} />}
              </FormField>
              <FormField id="ap-phil" label="Creative philosophy" optional hint="One or two sentences in your own voice." error={errors.creativePhilosophy?.message}>
                {(a) => <Textarea {...a} rows={3} {...register("creativePhilosophy")} />}
              </FormField>
            </>
          )}

          {step === 3 && (
            <>
              <FormField id="ap-portfolio" label="Portfolio website" optional error={errors.portfolioUrl?.message}>
                {(a) => <Input {...a} type="url" placeholder="https://" {...register("portfolioUrl")} />}
              </FormField>

              <fieldset className="grid gap-4">
                <legend className="mb-1 text-sm font-semibold">Links <span className="font-normal text-muted-foreground">(optional, up to 4)</span></legend>
                {links.fields.map((f, i) => (
                  <div key={f.id} className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-start">
                    <FormField id={`ap-link-label-${i}`} label="Label" error={errors.links?.[i]?.label?.message}>
                      {(a) => <Input {...a} placeholder="Instagram" {...register(`links.${i}.label`)} />}
                    </FormField>
                    <FormField id={`ap-link-url-${i}`} label="Link" error={errors.links?.[i]?.url?.message}>
                      {(a) => <Input {...a} type="url" placeholder="https://" {...register(`links.${i}.url`)} />}
                    </FormField>
                    <Button type="button" variant="ghost" size="icon" className="sm:mt-7" aria-label={`Remove link ${i + 1}`} onClick={() => links.remove(i)}>
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                {links.fields.length < 4 && (
                  <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => links.append({ label: "", url: "" })}>
                    <Plus aria-hidden="true" /> Add a link
                  </Button>
                )}
              </fieldset>

              <fieldset className="grid gap-4">
                <legend className="mb-1 text-sm font-semibold">Professional credits <span className="font-normal text-muted-foreground">(at least one)</span></legend>
                {credits.fields.map((f, i) => (
                  <div key={f.id} className="grid gap-3 border border-border p-4 sm:grid-cols-2">
                    <FormField id={`ap-c-title-${i}`} label="Title" error={errors.credits?.[i]?.title?.message} className="sm:col-span-2">
                      {(a) => <Input {...a} {...register(`credits.${i}.title`)} />}
                    </FormField>
                    <FormField id={`ap-c-year-${i}`} label="Year" error={errors.credits?.[i]?.year?.message}>
                      {(a) => <Input {...a} inputMode="numeric" maxLength={4} {...register(`credits.${i}.year`)} />}
                    </FormField>
                    <FormField id={`ap-c-role-${i}`} label="Your role" error={errors.credits?.[i]?.role?.message}>
                      {(a) => <Input {...a} placeholder="Director, Editor…" {...register(`credits.${i}.role`)} />}
                    </FormField>
                    <FormField id={`ap-c-format-${i}`} label="Format" error={errors.credits?.[i]?.format?.message}>
                      {(a) => (
                        <Controller control={control} name={`credits.${i}.format`} render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger {...a} className="h-11 w-full bg-surface"><SelectValue placeholder="Choose" /></SelectTrigger>
                            <SelectContent>{CREDIT_FORMATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        )} />
                      )}
                    </FormField>
                    {credits.fields.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" className="w-fit self-end" onClick={() => credits.remove(i)}>
                        <Trash2 aria-hidden="true" /> Remove credit
                      </Button>
                    )}
                  </div>
                ))}
                {(errors.credits?.root?.message || (typeof errors.credits?.message === "string" && errors.credits.message)) && (
                  <p role="alert" className="text-sm text-[#ee8585]">{errors.credits?.root?.message ?? errors.credits?.message}</p>
                )}
                {credits.fields.length < 8 && (
                  <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => credits.append({ title: "", year: "", role: "", format: "" })}>
                    <Plus aria-hidden="true" /> Add a credit
                  </Button>
                )}
              </fieldset>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-sm text-muted-foreground">Check your details. You can jump back to any step to make changes.</p>
              <dl className="divide-y divide-border border-y border-border">
                {[
                  [0, "Applicant", `${all.fullName ?? ""} · ${all.email ?? ""} · ${[all.city, all.country].filter(Boolean).join(", ")}`],
                  [1, "Professional identity", `${all.primaryDiscipline ?? ""}, active since ${all.activeFrom ?? ""}`],
                  [2, "Biography", all.biography ?? ""],
                  [3, "Portfolio and credits", `${(all.credits ?? []).filter((c) => c?.title).length} credit(s)${all.portfolioUrl ? ` · ${all.portfolioUrl}` : ""}${(all.links ?? []).length ? ` · ${(all.links ?? []).length} link(s)` : ""}`],
                ].map(([i, label, value]) => (
                  <div key={String(label)} className="flex items-start justify-between gap-6 py-4">
                    <div className="min-w-0">
                      <dt className="type-eyebrow text-gold">{label}</dt>
                      <dd className="mt-1 line-clamp-3 text-sm text-reading/90">{String(value)}</dd>
                    </div>
                    <Button type="button" variant="ghost" size="xs" onClick={() => setStep(Number(i))}>Edit</Button>
                  </div>
                ))}
              </dl>
              <FormField id="ap-confirm" label="" error={errors.confirm?.message}>
                {(a) => (
                  <div className="flex items-start gap-3">
                    <Controller control={control} name="confirm" render={({ field }) => (
                      <Checkbox id="ap-confirm" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} aria-invalid={a["aria-invalid"]} aria-describedby={a["aria-describedby"]} className="mt-1" />
                    )} />
                    <Label htmlFor="ap-confirm" className="font-normal leading-relaxed">
                      I confirm the information is accurate and I understand my application will be reviewed by the DORIS TV team.
                    </Label>
                  </div>
                )}
              </FormField>
            </>
          )}
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={() => { persist(); toast.success("Draft saved"); }}>
              Save draft
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next}>Continue</Button>
            ) : (
              <Button type="button" disabled={submitting} onClick={handleSubmit(() => setConfirmOpen(true))}>
                {submitting ? "Submitting…" : "Submit application"}
              </Button>
            )}
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Submit your application?"
        description="Once submitted you won't be able to edit it while it's under review. You can follow its status at any time."
        confirmLabel="Submit application"
        onConfirm={submit}
      />
    </div>
  );
}
