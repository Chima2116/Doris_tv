"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/features/auth/session-provider";
import { Wordmark } from "@/components/shared/wordmark";
import { Filmstrip } from "@/components/shared/filmstrip";
import { NavLinks } from "./nav-links";
import { PUBLIC_NAV } from "./nav-config";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(22rem,100vw)] gap-0 p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle asChild>
            <div>
              <Wordmark asLink={false} />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <Filmstrip />
        <nav aria-label="Primary" className="flex-1 px-6 py-6">
          <NavLinks
            items={PUBLIC_NAV}
            onNavigate={() => setOpen(false)}
            className="space-y-1"
            inactiveClassName="text-foreground hover:text-gold"
            linkClassName="py-3 font-display text-2xl font-black normal-case tracking-tight"
          />
        </nav>
        {!user && (
          <div className="space-y-2 border-t border-border p-6">
            <Button asChild className="w-full" onClick={() => setOpen(false)}>
              <Link href="/waitlist">Join the waitlist</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
