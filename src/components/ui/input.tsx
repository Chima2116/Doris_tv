import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 border border-input bg-surface px-3 text-base text-foreground transition-[border-color,background-color] duration-200 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/80 hover:border-white/70 focus-visible:border-gold focus-visible:bg-gold/[0.04] focus-visible:outline-none active:border-gold disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
