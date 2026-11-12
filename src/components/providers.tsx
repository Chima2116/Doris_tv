"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/features/auth/session-provider";
import { GatedActionDialog } from "@/features/auth/gated-action-dialog";
import { DemoAccountSwitcher } from "@/features/auth/demo-account-switcher";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      <GatedActionDialog />
      <Toaster />
      <DemoAccountSwitcher />
    </SessionProvider>
  );
}
