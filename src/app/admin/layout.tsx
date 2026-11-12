import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/admin-shell";

// This area is role-gated on the client (simulated), so children are intentionally not
// rendered for ineligible users. Opt out of Next's instant-navigation validation.
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — DORIS TV Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return <AdminShell>{children}</AdminShell>;
}
