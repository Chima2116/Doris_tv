"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Last-resort error boundary for unexpected rendering errors. */
export default function GlobalRouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="type-eyebrow text-gold">Something went wrong</p>
      <h1 className="mt-4 font-display text-4xl font-black">We hit a snag.</h1>
      <p className="mt-4 text-muted-foreground">An unexpected error stopped this page from loading. You can try again, or head back to the homepage.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline"><Link href="/">Go home</Link></Button>
      </div>
    </main>
  );
}
