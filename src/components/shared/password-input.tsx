"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** A password field with a button to show or hide what has been typed. */
export const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function PasswordInput(
  { className, ...props },
  ref,
) {
  const [shown, setShown] = React.useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={shown ? "text" : "password"} className={cn("pr-12", className)} {...props} />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground transition-colors duration-200 hover:text-gold focus-visible:text-gold focus-visible:outline-none"
      >
        {shown ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
});
