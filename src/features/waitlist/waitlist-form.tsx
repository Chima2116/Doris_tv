"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { waitlistStore } from "@/features/admin/admin-stores";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name (at least 2 characters)."),
  email: z.email("Enter a valid email address."),
  interest: z.enum(["reader", "filmmaker", "writer", "other"], { error: "Tell us how you'll use DORIS TV." }),
});
type Values = z.infer<typeof schema>;

/**
 * SIMULATED submission. Nothing is sent or stored. Use an address ending in
 * "@fail.test" to see the error state.
 */
async function submitWaitlist(values: Values): Promise<{ ok: true } | { ok: false; error: string }> {
  await new Promise((r) => setTimeout(r, 900));
  if (values.email.toLowerCase().endsWith("@fail.test")) {
    return { ok: false, error: "We couldn't reach the waitlist just now. Please try again in a moment." };
  }
  return { ok: true };
}

export function WaitlistForm() {
  const [done, setDone] = useState<Values | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "" } });

  if (done) {
    return (
      <div role="status" className="border border-success/40 bg-success/5 p-8">
        <CheckCircle2 className="size-8 text-[#6fd09b]" aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl font-black">You&apos;re on the list, {done.name.split(" ")[0]}.</h2>
        <p className="mt-3 text-reading/80">
          In the live product we&apos;d send a confirmation to <strong>{done.email}</strong>. This is a
          prototype, so nothing has been sent or stored.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Next step: create an account with the same email to take part in the Community.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/sign-up">Create an account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/journal">Read the Journal</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="grid gap-6 border border-border bg-surface p-6 sm:p-8"
      onSubmit={handleSubmit(async (values) => {
        setServerError(null);
        const res = await submitWaitlist(values);
        if (res.ok) {
          waitlistStore.add({ name: values.name, email: values.email, interest: values.interest });
          setDone(values);
        }
        else setServerError(res.error);
      })}
    >
      <FormField id="wl-name" label="Full name" error={errors.name?.message}>
        {(aria) => <Input {...aria} autoComplete="name" {...register("name")} />}
      </FormField>
      <FormField id="wl-email" label="Email address" error={errors.email?.message}>
        {(aria) => <Input {...aria} type="email" autoComplete="email" {...register("email")} />}
      </FormField>
      <FormField id="wl-interest" label="How will you use DORIS TV?" error={errors.interest?.message}>
        {(aria) => (
          <Controller
            control={control}
            name="interest"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger {...aria} className="h-11 w-full bg-surface" onBlur={field.onBlur}>
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reader">I love African film</SelectItem>
                  <SelectItem value="filmmaker">I&apos;m a filmmaker</SelectItem>
                  <SelectItem value="writer">I write about film</SelectItem>
                  <SelectItem value="other">Something else</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        )}
      </FormField>

      {serverError && (
        <p role="alert" className="border border-danger/50 bg-danger/10 p-3 text-sm text-[#ee8585]">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Joining…" : "Join the waitlist"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Free to join. Joining the waitlist alone doesn&apos;t unlock Community participation; you&apos;ll
        also create and verify an account.
        {process.env.NODE_ENV !== "production" && (
          <span className="mt-1 block text-gold/80">Demo: an address ending in @fail.test shows the error state.</span>
        )}
      </p>
    </form>
  );
}
