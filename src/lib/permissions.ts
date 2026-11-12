import type { Member } from "@/data/types";

/**
 * Simulated access rules.
 *
 * IMPORTANT: these checks only shape the prototype UI. They are NOT secure
 * access control. A future backend must enforce every permission independently.
 *
 * Rule precedence: account status beats role. A suspended moderator keeps no
 * moderation capability.
 */

export type CurrentUser = Member | null; // null = guest

export const isActive = (u: CurrentUser): u is Member =>
  !!u && u.accountStatus === "active";

const hasRole = (u: CurrentUser, role: Member["roles"][number]) =>
  isActive(u) && u.roles.includes(role);

/** Authenticated + active + verified email + linked waitlist record + member role. */
export const canParticipateInCommunity = (u: CurrentUser) =>
  isActive(u) && u.emailVerified && u.waitlistLinked && u.roles.includes("member");

/** Follow / save / react / report need the same eligibility as participating. */
export const canUseMemberActions = canParticipateInCommunity;

export const canApplyAsFilmmaker = (u: CurrentUser) =>
  isActive(u) && u.emailVerified && u.waitlistLinked;

export const isVerifiedFilmmaker = (u: CurrentUser) => hasRole(u, "filmmaker");
export const canModerate = (u: CurrentUser) => hasRole(u, "moderator") || hasRole(u, "admin");
export const isAdmin = (u: CurrentUser) => hasRole(u, "admin");
export const canAccessAdmin = canModerate;

export type GateAction =
  | "follow"
  | "save"
  | "react"
  | "reply"
  | "create_discussion"
  | "report"
  | "apply_filmmaker";

export type GateResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: "guest" | "unverified" | "no_waitlist" | "restricted";
      title: string;
      message: string;
      cta: { label: string; href: string };
    };

const ACTION_COPY: Record<GateAction, string> = {
  follow: "follow filmmakers and members",
  save: "save Journal articles",
  react: "react to discussions",
  reply: "join the conversation",
  create_discussion: "start a discussion",
  report: "report content",
  apply_filmmaker: "apply for a filmmaker profile",
};

/** Explains what a visitor needs to do to perform a member-gated action. */
export function checkGate(u: CurrentUser, action: GateAction): GateResult {
  const verb = ACTION_COPY[action];
  const eligible =
    action === "apply_filmmaker" ? canApplyAsFilmmaker(u) : canParticipateInCommunity(u);
  if (eligible) return { allowed: true };

  if (!u) {
    return {
      allowed: false,
      reason: "guest",
      title: "Sign in to continue",
      message: `You need a DORIS TV member account to ${verb}. Sign in, or join the waitlist to get started. We'll pick up where you left off.`,
      cta: { label: "Sign in", href: "/sign-in" },
    };
  }
  if (u.accountStatus !== "active") {
    return {
      allowed: false,
      reason: "restricted",
      title: "Your account is limited",
      message: `Your account is currently ${u.accountStatus}, so you can't ${verb} right now. You can still read everything on DORIS TV.`,
      cta: { label: "Read the Journal", href: "/journal" },
    };
  }
  if (!u.emailVerified) {
    return {
      allowed: false,
      reason: "unverified",
      title: "Verify your email",
      message: `Confirm your email address to ${verb}. Check your inbox for the verification link.`,
      cta: { label: "Go to settings", href: "/settings" },
    };
  }
  return {
    allowed: false,
    reason: "no_waitlist",
    title: "Join the waitlist first",
    message: `Community participation is open to members on the DORIS TV waitlist. Join with the email on your account to ${verb}.`,
    cta: { label: "Join the waitlist", href: "/waitlist" },
  };
}
