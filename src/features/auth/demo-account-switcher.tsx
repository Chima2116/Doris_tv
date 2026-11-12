"use client";

import { useState } from "react";
import { FlaskConical, Check } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DEMO_IDENTITIES } from "@/data/mock/demo-users";
import { cn } from "@/lib/utils";
import { useSession } from "./session-provider";

/**
 * DEVELOPMENT / DEMO ONLY. Switches the simulated current user so each role's
 * experience can be tested. Not authentication and not security. Hidden in
 * production builds.
 */
export function DemoAccountSwitcher() {
  const { identity, switchIdentity } = useSession();
  const [open, setOpen] = useState(false);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Demo account switcher (development only)"
          className="fixed bottom-4 right-4 z-40 flex h-11 items-center gap-2 border border-gold/60 bg-background px-3 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
        >
          <FlaskConical className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Demo: {identity}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="border-b border-border p-4">
          <p className="type-eyebrow text-gold">Development only</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Switch the simulated user. This is not real authentication.
          </p>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto py-1">
          {DEMO_IDENTITIES.map((i) => (
            <li key={i.key}>
              <button
                type="button"
                onClick={() => {
                  switchIdentity(i.key);
                  setOpen(false);
                  toast.success(`Now viewing as ${i.label}`);
                }}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5",
                  identity === i.key && "bg-white/5",
                )}
              >
                <Check
                  className={cn("mt-0.5 size-4 shrink-0", identity === i.key ? "text-gold" : "opacity-0")}
                  aria-hidden="true"
                />
                <span>
                  <span className="block text-sm font-semibold">{i.label}</span>
                  <span className="block text-xs text-muted-foreground">{i.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
