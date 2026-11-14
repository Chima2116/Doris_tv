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
      <SheetContent side="right" className="w-[min(42.9rem,100vw)] gap-0 p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle asChild>
            <div>
              <Wordmark asLink={false} />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Primary" className="flex-1 px-6 py-6">
          <NavLinks
            items={PUBLIC_NAV}
            onNavigate={() => setOpen(false)}
            className="space-y-1"
            inactiveClassName="text-foreground/90 hover:text-foreground"
            linkClassName="py-2 text-3xl font-bold leading-tight tracking-tight underline-offset-[10px]"
          />
        </nav>
        {!user && (
          <div className="space-y-2 border-t border-border p-6">
            <Button asChild className="w-full" onClick={() => setOpen(false)}>
              <Link href="/sign-up">Create a free account</Link>
            </Button>
            <Link href="/sign-in" onClick={() => setOpen(false)} className="block py-2 text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Sign in
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
