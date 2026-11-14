"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Wordmark } from "@/components/shared/wordmark";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV, type AdminNavItem } from "@/components/navigation/nav-config";
import { isActivePath } from "@/components/navigation/nav-links";
import { useSession } from "@/features/auth/session-provider";
import { canAccessAdmin, isAdmin } from "@/lib/permissions";
import { cn } from "@/lib/utils";

function SidebarNav({ items, onNavigate }: { items: AdminNavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="space-y-0.5 p-3">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-gold bg-white/5 text-foreground"
                : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-gold",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Restricted({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-md text-center">
        <ShieldAlert className="mx-auto size-10 text-gold" aria-hidden="true" />
        <h1 className="mt-4 type-display-md">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{body}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Prototype note: this is a simulated check. A backend must enforce admin access.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to DORIS TV</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Separate, operational admin interface: persistent sidebar on desktop, drawer on
 * mobile. Admins see every section; moderators see moderation only. Account status
 * beats role, so a suspended moderator is locked out.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!canAccessAdmin(user)) {
    const suspended = user && user.accountStatus !== "active";
    return (
      <Restricted
        title={suspended ? "Your account is limited" : "Admin access required"}
        body={
          suspended
            ? "Your account status means moderation and admin tools are switched off, whatever your role."
            : "This area is for DORIS TV moderators and administrators. Use the demo switcher to try a different role."
        }
      />
    );
  }

  const admin = isAdmin(user);
  const items = admin ? ADMIN_NAV : ADMIN_NAV.filter((i) => i.moderator);
  const allowedHere = items.some((i) => isActivePath(pathname, i.href));
  const current = items.find((i) => isActivePath(pathname, i.href) && i.href !== "/admin") ?? items[0];

  if (!allowedHere) {
    return (
      <Restricted
        title="Admin only"
        body="Moderators can review reports, hide content pending review, add notes and escalate. Other sections need an administrator."
      />
    );
  }

  const roleLabel = admin ? "Admin" : "Moderator";

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <Wordmark size="sm" />
          <Badge variant="gold">{roleLabel}</Badge>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav items={items} />
        </div>
        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" /> View public site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(35.1rem,100vw)] gap-0 bg-surface p-0">
              <SheetHeader className="border-b border-border p-5">
                <SheetTitle asChild>
                  <div>
                    <Wordmark asLink={false} size="sm" />
                  </div>
                </SheetTitle>
                <SheetDescription className="sr-only">Admin navigation</SheetDescription>
              </SheetHeader>
              <SidebarNav items={items} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="font-sans text-sm font-semibold tracking-tight">{current.label}</h1>
          <Badge variant="outline" className="ml-auto lg:hidden">
            {roleLabel}
          </Badge>
        </header>
        <main id="main" className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
