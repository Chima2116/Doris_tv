import {
  LayoutDashboard,
  Newspaper,
  ClipboardCheck,
  Clapperboard,
  ShieldAlert,
  Users,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

/** Public primary navigation. There is intentionally no Archive item in Stage 1. */
export const PUBLIC_NAV = [
  { href: "/journal", label: "Journal" },
  { href: "/filmmakers", label: "Filmmakers" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
] as const;

export const MEMBER_NAV = [
  { href: "/saved", label: "Saved" },
  { href: "/following", label: "Following" },
  { href: "/settings", label: "Settings" },
  { href: "/filmmaker-application", label: "Filmmaker application" },
] as const;

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Moderators only see items flagged here; admins see everything. */
  moderator?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/journal", label: "Journal", icon: Newspaper },
  { href: "/admin/applications", label: "Applications", icon: ClipboardCheck },
  { href: "/admin/filmmakers", label: "Filmmakers", icon: Clapperboard },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert, moderator: true },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];
