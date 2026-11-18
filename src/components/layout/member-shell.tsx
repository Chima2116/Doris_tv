"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { usePathname } from "next/navigation";
import { useSession } from "@/features/auth/session-provider";
import { isVerifiedFilmmaker } from "@/lib/permissions";

/**
 * Wraps member-area routes. Guests get an explanation and a next step rather than
 * a blank page. (Prototype only: a real backend must enforce this server-side.)
 */
export function MemberShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const pathname = usePathname();
  // Other people's profiles are public: show them as they are, with no account tabs.
  const ownOrPublicProfile = pathname.startsWith("/profile/") && (!user || pathname !== `/profile/${user.username}`);
  if (ownOrPublicProfile) return <>{children}</>;

  const filmmaker = !!user && isVerifiedFilmmaker(user);
  const tabs = user
    ? [
        { href: `/profile/${user.username}`, label: "Profile" },
        { href: "/saved", label: "Saved" },
        { href: "/following", label: "Following" },
        ...(filmmaker ? [{ href: "/write", label: "My journals" }] : []),
        { href: "/settings", label: "Settings" },
      ]
    : [];

  if (!user) {
    return (
      <PageContainer className="py-24">
        <div className="mx-auto max-w-lg text-center">
          <Eyebrow>Members area</Eyebrow>
          <h1 className="mt-3 type-display-md">Sign in to see this page</h1>
          <p className="mt-4 text-muted-foreground">
            Saved articles, following and your filmmaker application live in your member account.
            You can still read the Journal and browse filmmakers without one.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-up">Create a free account</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <div className="border-b border-border">
        <PageContainer>
          <nav aria-label="Your account" className="border-b border-border">
            <TabRow items={tabs} />
          </nav>
        </PageContainer>
      </div>
      {children}
    </>
  );
}

/** A row of tabs. The current page is underlined so people always know where they are. */
function TabRow({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <ul className="-mb-px flex gap-7 overflow-x-auto">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-block whitespace-nowrap border-b-2 py-4 text-sm font-semibold transition-colors duration-200 ${active ? "border-gold text-reading" : "border-transparent text-reading/60 hover:text-reading"}`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
