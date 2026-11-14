"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "./session-provider";

const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * Non-blocking prompt for member-gated actions (PRD §4.3): explains why the
 * action is unavailable, offers the next step, and keeps the visitor on the
 * page. The intended action is remembered and completes after simulated sign-in.
 */
export function GatedActionDialog() {
  const { pendingGate, dismissGate, deferGate, signInAs } = useSession();
  const result = pendingGate?.result;

  return (
    <Dialog open={!!pendingGate?.open} onOpenChange={(o) => !o && dismissGate()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <p className="type-eyebrow text-gold">Members only</p>
          <DialogTitle className="text-2xl">{result?.title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {result?.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:flex-col sm:items-stretch">
          {result && (
            <Button asChild onClick={deferGate}>
              <Link href={result.cta.href}>{result.cta.label}</Link>
            </Button>
          )}
          {result?.reason === "guest" && (
            <Button asChild variant="outline" onClick={deferGate}>
              <Link href="/sign-up">Create a free account</Link>
            </Button>
          )}
          {IS_DEV && result?.reason === "guest" && (
            <Button variant="ghost" size="sm" onClick={() => signInAs("member")}>
              Demo: simulate sign-in as a member
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={dismissGate}>
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
