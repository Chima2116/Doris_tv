import Link from "next/link";
import { Wordmark } from "@/components/shared/wordmark";
import { Filmstrip } from "@/components/shared/filmstrip";

/** Minimal, focused layout for sign-in, sign-up and password reset. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Filmstrip />
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <Wordmark />
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
        >
          Back to site
        </Link>
      </header>
      <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-16 sm:px-0">
        {children}
      </main>
    </div>
  );
}
