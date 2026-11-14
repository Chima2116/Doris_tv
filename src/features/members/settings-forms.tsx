"use client";

import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import type { ProfileSection } from "@/data/types";
import { useSession } from "@/features/auth/session-provider";
import { DEFAULT_PREFS, memberStore, SECTIONS, useMemberStore } from "./member-store";

function Card({ id, title, description, children }: { id?: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id ?? title}-h`} className="scroll-mt-24 border border-border bg-surface p-6 sm:p-8">
      <h2 id={`${id ?? title}-h`} className="font-display text-2xl font-black">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ───── Profile ───── */
const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Enter your name (at least 2 characters).").max(60, "Keep your name under 60 characters."),
  bio: z.string().trim().max(280, "Keep your bio under 280 characters."),
  location: z.string().trim().max(60, "Keep your location under 60 characters."),
});

function ProfileForm() {
  const { user } = useSession();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { displayName: user?.displayName ?? "", bio: user?.bio ?? "", location: user?.location ?? "" },
  });
  if (!user) return null;

  return (
    <Card title="Profile" description="How you appear to other members across DORIS TV.">
      <form
        noValidate
        className="grid gap-5"
        onSubmit={handleSubmit(async (v) => {
          await new Promise((r) => setTimeout(r, 500));
          memberStore.patch(user.id, { displayName: v.displayName, bio: v.bio || undefined, location: v.location || undefined });
          reset(v);
          toast.success("Profile updated");
        })}
      >
        <div className="grid gap-2">
          <Label htmlFor="st-username">Username</Label>
          <Input id="st-username" value={`@${user.username}`} readOnly disabled aria-describedby="st-username-hint" />
          <p id="st-username-hint" className="text-xs text-muted-foreground">Usernames can&apos;t be changed in this prototype.</p>
        </div>
        <FormField id="st-name" label="Display name" error={errors.displayName?.message}>
          {(a) => <Input {...a} autoComplete="name" {...register("displayName")} />}
        </FormField>
        <FormField id="st-bio" label="Biography" optional error={errors.bio?.message} hint="Up to 280 characters.">
          {(a) => <Textarea {...a} rows={4} {...register("bio")} />}
        </FormField>
        <FormField id="st-location" label="Location" optional error={errors.location?.message}>
          {(a) => <Input {...a} placeholder="City, country" {...register("location")} />}
        </FormField>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Saving…" : "Save profile"}
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/profile/${user.username}`}>View profile</Link>
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ───── Privacy ───── */
type PrivacyValues = { visibility: "public" | "private"; show: Record<ProfileSection, boolean> };

function PrivacyForm() {
  const { user } = useSession();
  const { control, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<PrivacyValues>({
    values: {
      visibility: user?.profileVisibility ?? "public",
      show: Object.fromEntries(SECTIONS.map((s) => [s.key, !user?.privacy.hiddenSections.includes(s.key)])) as Record<ProfileSection, boolean>,
    },
  });
  const isPrivate = useWatch({ control, name: "visibility" }) === "private";
  if (!user) return null;

  return (
    <Card id="privacy" title="Privacy" description="Your profile always stays discoverable. These settings control what other people can see on it.">
      <form
        className="grid gap-8"
        onSubmit={handleSubmit(async (v) => {
          await new Promise((r) => setTimeout(r, 500));
          const hidden = SECTIONS.filter((s) => !v.show[s.key]).map((s) => s.key);
          memberStore.patch(user.id, {
            profileVisibility: v.visibility,
            privacy: { visibility: v.visibility, hiddenSections: hidden },
          });
          reset(v);
          toast.success("Privacy settings saved");
        })}
      >
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Profile visibility</legend>
          <Controller
            control={control}
            name="visibility"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-4">
                {[
                  ["public", "Public", "Everything on your profile is visible, except sections you turn off below."],
                  ["private", "Private", "People can still find you, but only see your name, username and join date."],
                ].map(([v, l, d]) => (
                  <div key={v} className="flex items-start gap-3">
                    <RadioGroupItem id={`pv-${v}`} value={v} className="mt-1" />
                    <Label htmlFor={`pv-${v}`} className="grid gap-0.5 font-normal">
                      <span className="font-semibold">{l}</span>
                      <span className="text-xs text-muted-foreground">{d}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        </fieldset>

        <fieldset disabled={isPrivate} className="disabled:opacity-50">
          <legend className="mb-1 text-sm font-semibold">Sections others can see</legend>
          <p className="mb-4 text-xs text-muted-foreground">
            {isPrivate ? "Hidden while your profile is private. Your choices are kept if you go public again." : "Turn a section off to hide it from other people."}
          </p>
          <ul className="divide-y divide-border border-y border-border">
            {SECTIONS.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-4 py-3">
                <Label htmlFor={`ps-${s.key}`} className="grid gap-0.5 font-normal">
                  <span className="font-semibold">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{s.hint}</span>
                </Label>
                <Controller
                  control={control}
                  name={`show.${s.key}`}
                  render={({ field }) => (
                    <Switch id={`ps-${s.key}`} checked={isPrivate ? false : field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </li>
            ))}
          </ul>
        </fieldset>
        <div>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Saving…" : "Save privacy settings"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ───── Account ───── */
function AccountForm() {
  const { user } = useSession();
  const { prefs } = useMemberStore();
  const current = (user && prefs[user.id]) || DEFAULT_PREFS;
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm({ values: current });
  if (!user) return null;

  return (
    <Card title="Account" description="Your membership status and notification preferences.">
      <dl className="mb-8 grid gap-4 sm:grid-cols-2">
        {[
          ["Email", user.emailVerified],
        ].map(([label, ok]) => (
          <div key={String(label)} className="grid grid-cols-[auto_1fr] gap-x-3 border border-border p-4">
            {ok ? <CheckCircle2 className="row-span-2 mt-0.5 size-5 text-[#6fd09b]" aria-hidden="true" /> : <CircleAlert className="row-span-2 mt-0.5 size-5 text-warning" aria-hidden="true" />}
            <dt className="text-sm font-semibold">{label}</dt>
            <dd className="text-xs text-muted-foreground">
              {label === "Email"
                ? ok ? "Verified" : "Not verified. Verify your email to take part in the Community."
                : ""}
            </dd>
          </div>
        ))}
      </dl>
      <form
        className="grid gap-5"
        onSubmit={handleSubmit((v) => {
          memberStore.setPrefs(user.id, v);
          reset(v);
          toast.success("Preferences saved");
        })}
      >
        {[
          ["notifyReplies", "Replies to my discussions", "Get an email when someone replies to something you posted."],
          ["notifyNews", "Journal and DORIS TV news", "An occasional note about new stories and features."],
        ].map(([name, label, hint]) => (
          <div key={name} className="flex items-center justify-between gap-4">
            <Label htmlFor={`pref-${name}`} className="grid gap-0.5 font-normal">
              <span className="font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </Label>
            <Controller
              control={control}
              name={name as "notifyReplies" | "notifyNews"}
              render={({ field }) => <Switch id={`pref-${name}`} checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">Prototype: no emails are sent.</p>
        <div>
          <Button type="submit" disabled={!isDirty}>
            Save preferences
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function SettingsForms() {
  return (
    <div className="grid gap-8">
      <ProfileForm />
      <PrivacyForm />
      <AccountForm />
    </div>
  );
}
