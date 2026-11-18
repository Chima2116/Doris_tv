"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/password-input";
import { FormField } from "@/components/shared/form-field";
import { useSession } from "./session-provider";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const email = z.email("Enter a valid email address.");
const password = z.string().min(8, "Use at least 8 characters.");

const PROTOTYPE_NOTE = supabaseConfigured
  ? ""
  : "Prototype: no real authentication happens. Any valid details sign you in as a demo member.";

function Shell({ title, intro, children, footer }: { title: string; intro: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div>
      <h1 className="type-display-md">{title}</h1>
      <p className="mt-3 text-muted-foreground">{intro}</p>
      <div className="mt-8">{children}</div>
      <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">{footer}</div>
    </div>
  );
}

function ServerError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-danger/50 bg-danger/10 p-3 text-sm text-[#ee8585]">
      {message}
    </p>
  );
}

/* ───────────── Sign in ───────────── */
const signInSchema = z.object({ email, password });

export function SignInForm() {
  const router = useRouter();
  const { signInAs } = useSession();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof signInSchema>>({ resolver: zodResolver(signInSchema) });

  return (
    <Shell
      title="Sign in"
      intro="Welcome back. Pick up where you left off."
      footer={
        <>
          New to DORIS TV?{" "}
          <Link href="/sign-up" className="text-gold underline-offset-4 transition-colors duration-200 hover:underline focus-visible:underline">
            create an account
          </Link>
          .
        </>
      }
    >
      <form
        noValidate
        className="grid gap-6"
        onSubmit={handleSubmit(async (v) => {
          setError(null);
          const supabase = getSupabase();
          if (supabase) {
            const { error: authError } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
            if (authError) {
              setError("That email and password don't match. Check them and try again.");
              return;
            }
            router.push("/");
            return;
          }
          await wait(700);
          if (v.email.toLowerCase().endsWith("@fail.test")) {
            setError("That email and password don't match. Check them and try again.");
            return;
          }
          const back = signInAs("member");
          router.push(back ?? "/");
        })}
      >
        <FormField id="si-email" label="Email" error={errors.email?.message}>
          {(a) => <Input {...a} type="email" autoComplete="email" {...register("email")} />}
        </FormField>
        <FormField id="si-password" label="Password" error={errors.password?.message}>
          {(a) => <PasswordInput {...a} autoComplete="current-password" {...register("password")} />}
        </FormField>
        <div className="-mt-2 text-right">
          <Link href="/reset-password" className="text-xs font-medium text-gold underline-offset-4 transition-colors duration-200 hover:underline focus-visible:underline">
            Forgot your password?
          </Link>
        </div>
        <ServerError message={error} />
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {PROTOTYPE_NOTE}
          {!supabaseConfigured && process.env.NODE_ENV !== "production" && " Use an @fail.test address to see the error state."}
        </p>
      </form>
    </Shell>
  );
}

/* ───────────── Sign up ───────────── */
const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name (at least 2 characters)."),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9_]{3,30}$/, "Use 3 to 30 letters, numbers or underscores."),
    email,
    password,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match." });

export function SignUpForm() {
  const router = useRouter();
  const { signInAs } = useSession();
  const [sent, setSent] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof signUpSchema>>({ resolver: zodResolver(signUpSchema) });

  if (sent) {
    return (
      <div role="status" className="border border-success/40 bg-success/5 p-8">
        <MailCheck className="size-8 text-[#6fd09b]" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-black">Check your inbox</h1>
        <p className="mt-3 text-reading/80">
          {supabaseConfigured ? "We've sent a verification link to" : "In the live product we'd email a verification link to"}{" "}
          <strong>{sent}</strong>. {supabaseConfigured ? "Open it to confirm your email, then sign in." : "You need a verified email to take part in the Community."}
        </p>
        {!supabaseConfigured && (
          <Button
            className="mt-6 w-full"
            onClick={() => {
              const back = signInAs("newMember");
              router.push(back ?? "/");
            }}
          >
            Demo: simulate email verification
          </Button>
        )}
        <p className="mt-3 text-xs text-muted-foreground">{PROTOTYPE_NOTE}</p>
      </div>
    );
  }

  return (
    <Shell
      title="Create an account"
      intro="Create a free account to read, join the conversation and apply as a filmmaker."
      footer={
        <>
          Already a member?{" "}
          <Link href="/sign-in" className="text-gold underline underline-offset-4 transition-colors duration-200 hover:text-white focus-visible:text-white">
            Sign in
          </Link>
        </>
      }
    >
      <form
        noValidate
        className="grid gap-6"
        onSubmit={handleSubmit(async (v) => {
          setSignUpError(null);
          const supabase = getSupabase();
          if (!supabase) {
            await wait(800);
            setSent(v.email);
            return;
          }
          const { error: authError } = await supabase.auth.signUp({
            email: v.email,
            password: v.password,
            options: { data: { username: v.username, display_name: v.name } },
          });
          if (authError) {
            setSignUpError(
              authError.message.includes("already")
                ? "An account with this email already exists. Try signing in."
                : `We couldn't create your account: ${authError.message}`,
            );
            return;
          }
          setSent(v.email);
        })}
      >
        <FormField id="su-name" label="Full name" error={errors.name?.message}>
          {(a) => <Input {...a} autoComplete="name" {...register("name")} />}
        </FormField>
        <FormField id="su-username" label="Username" hint="Shown on your profile, for example @ngozi_ihejirika." error={errors.username?.message}>
          {(a) => <Input {...a} autoComplete="username" {...register("username")} />}
        </FormField>
        <FormField id="su-email" label="Email" error={errors.email?.message}>
          {(a) => <Input {...a} type="email" autoComplete="email" {...register("email")} />}
        </FormField>
        <FormField id="su-password" label="Password" hint="At least 8 characters." error={errors.password?.message}>
          {(a) => <PasswordInput {...a} autoComplete="new-password" {...register("password")} />}
        </FormField>
        <FormField id="su-confirm" label="Confirm password" error={errors.confirm?.message}>
          {(a) => <PasswordInput {...a} autoComplete="new-password" {...register("confirm")} />}
        </FormField>
        <ServerError message={signUpError} />
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </Shell>
  );
}

/* ───────────── Reset password ───────────── */
const resetSchema = z.object({ email });

export function ResetPasswordForm() {
  const [sent, setSent] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  if (sent) {
    return (
      <div role="status" className="border border-border bg-surface p-8">
        <MailCheck className="size-8 text-gold" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-black">Check your email</h1>
        <p className="mt-3 text-reading/80">
          If an account exists for <strong>{sent}</strong>, we&apos;ll send reset instructions. (Prototype:
          no email is sent.)
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <Shell
      title="Reset your password"
      intro="Enter your email and we'll send you a link to choose a new one."
      footer={
        <Link href="/sign-in" className="text-gold underline underline-offset-4 transition-colors duration-200 hover:text-white focus-visible:text-white">
          Back to sign in
        </Link>
      }
    >
      <form
        noValidate
        className="grid gap-6"
        onSubmit={handleSubmit(async (v) => {
          await wait(700);
          setSent(v.email);
        })}
      >
        <FormField id="rp-email" label="Email" error={errors.email?.message}>
          {(a) => <Input {...a} type="email" autoComplete="email" {...register("email")} />}
        </FormField>
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </Shell>
  );
}
