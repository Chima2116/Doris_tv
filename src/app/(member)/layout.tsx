import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MemberShell } from "@/components/layout/member-shell";

// This area is role-gated on the client (simulated), so children are intentionally not
// rendered for ineligible users. Opt out of Next's instant-navigation validation.
export const instant = false;

export default function MemberLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <MemberShell>{children}</MemberShell>
      </main>
      <SiteFooter />
    </>
  );
}
