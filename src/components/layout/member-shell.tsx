"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { NavLinks } from "@/components/navigation/nav-links";
import { useSession } from "@/features/auth/session-provider";
import { isVerifiedFilmmaker } from "@/lib/permissions";

/**
 * Wraps member-area routes. Guests get an explanation and a next step rather than
 * a blank page. (Prototype only: a real backend must enforce this server-side.)
 */
export function MemberShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();

  const items = user
    ? [
        { href: `/profile/${user.username}`, label: "Profile" },
        { href: "/saved", label: "Saved" },
        { href: "/following", label: "Following" },
        isVerifiedFilmmaker(user)
          ? { href: "/filmmaker-dashboard/profile", label: "Filmmaker profile" }
          : { href: "/filmmaker-application", label: "Filmmaker application" },
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
              <Link href="/waitlist">Join the waitlist</Link>
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
          <nav aria-label="Member" className="-mx-1 overflow-x-auto">
            <NavLinks
              items={items}
              className="flex min-w-max items-center gap-6 px-1"
              linkClassName="py-4"
            />
          </nav>
        </PageContainer>
      </div>
      {children}
    </>
  );
}
