"use client";

import { applicationsStore } from "@/features/applications/applications-store";
import { community } from "@/features/community/community-store";
import { revisionsStore } from "@/features/filmmakers/revisions-store";
import { memberStore } from "@/features/members/member-store";
import type { FilmmakerApplication, Member, ModerationReport, ProfileRevision, Filmmaker, PublicationStatus } from "@/data/types";
import { auditStore, filmmakerAdminStore, cmsStore } from "./admin-stores";
import { makeId } from "@/lib/persisted-store";

/**
 * Every admin/moderator operation goes through here so it (1) updates the right store
 * and (2) lands in the audit log. PROTOTYPE: these are simulations, and the UI checks
 * are not security. A backend must authorise each of these independently.
 */
type Actor = Pick<Member, "id" | "displayName">;

/* ───── Filmmaker applications ───── */
export const applications = {
  markUnderReview(actor: Actor, app: FilmmakerApplication) {
    applicationsStore.setStatus(app, "under_review");
    auditStore.log(actor, "application.under_review", `${app.details.fullName}: moved to under review`);
  },
  approve(actor: Actor, app: FilmmakerApplication, note?: string) {
    applicationsStore.setStatus(app, "approved", { note });
    auditStore.log(actor, "application.approved", `${app.details.fullName}: approved (filmmaker profile created)`);
  },
  reject(actor: Actor, app: FilmmakerApplication, reason: string) {
    applicationsStore.setStatus(app, "rejected", { reason });
    auditStore.log(actor, "application.rejected", `${app.details.fullName}: rejected. ${reason}`);
  },
};

/* ───── Filmmaker profiles ───── */
export const filmmakers = {
  approveRevision(actor: Actor, rev: ProfileRevision, name: string) {
    revisionsStore.decide(rev.id, "approved");
    auditStore.log(actor, "revision.approved", `${name}: profile revision approved and published`);
  },
  rejectRevision(actor: Actor, rev: ProfileRevision, name: string, reason: string) {
    revisionsStore.decide(rev.id, "rejected", reason);
    auditStore.log(actor, "revision.rejected", `${name}: profile revision rejected. ${reason}`);
  },
  setPublication(actor: Actor, f: Filmmaker, status: PublicationStatus) {
    filmmakerAdminStore.patch(f.id, { publicationStatus: status });
    auditStore.log(actor, `filmmaker.${status}`, `${f.name}: profile ${status}`);
  },
  setVerification(actor: Actor, f: Filmmaker, verified: boolean) {
    filmmakerAdminStore.patch(f.id, { verificationStatus: verified ? "verified" : "unverified" });
    auditStore.log(actor, verified ? "filmmaker.verified" : "filmmaker.unverified", `${f.name}: ${verified ? "verified" : "verification removed"}`);
  },
};

/* ───── Moderation ───── */
const systemNote = (body: string) => ({ id: makeId("n"), authorId: "system", body, createdAt: new Date().toISOString() });
const note = (actor: Actor, body: string) => ({ id: makeId("n"), authorId: actor.id, body, createdAt: new Date().toISOString() });

function setTargetStatus(report: ModerationReport, status: "published" | "hidden" | "deleted", reason?: string) {
  const patch = { status, hiddenReason: status === "hidden" ? reason : undefined };
  if (report.target.type === "discussion") community.patchDiscussion(report.target.id, patch);
  else community.patchReply(report.target.id, patch);
}

export const moderation = {
  addNote(actor: Actor, report: ModerationReport, body: string) {
    community.patchReport(report.id, { notes: [...report.notes, note(actor, body)] });
    auditStore.log(actor, "report.note", `Note added to report ${report.id}`);
  },
  /** No action needed. Reporter is told the outcome. */
  clear(actor: Actor, report: ModerationReport) {
    community.patchReport(report.id, {
      status: "cleared",
      resolution: "No action needed.",
      notes: [...report.notes, systemNote("Reviewed: no action needed. Reporter notified (simulated).")],
    });
    auditStore.log(actor, "report.cleared", `Report ${report.id} cleared`);
  },
  /** Hide pending admin review. Content is not deleted. */
  hide(actor: Actor, report: ModerationReport) {
    setTargetStatus(report, "hidden", "Hidden by a moderator pending admin review.");
    community.patchReport(report.id, {
      status: "hidden",
      notes: [...report.notes, systemNote("Content hidden pending admin review. Reporter notified (simulated).")],
    });
    auditStore.log(actor, "content.hidden", `${report.target.type} ${report.target.id} hidden pending admin review`);
  },
  escalate(actor: Actor, report: ModerationReport) {
    community.patchReport(report.id, {
      status: "escalated",
      escalatedAt: new Date().toISOString(),
      notes: [...report.notes, systemNote("Escalated to an administrator.")],
    });
    auditStore.log(actor, "report.escalated", `Report ${report.id} escalated to admin`);
  },
  /* Admin-only below */
  restore(actor: Actor, report: ModerationReport) {
    setTargetStatus(report, "published");
    community.patchReport(report.id, {
      status: "resolved",
      resolution: "Content restored by an administrator.",
      notes: [...report.notes, systemNote("Content restored. Reporter notified (simulated).")],
    });
    auditStore.log(actor, "content.restored", `${report.target.type} ${report.target.id} restored`);
  },
  /** Admin permanent removal (simulated as a soft delete; the audit log records it). */
  remove(actor: Actor, report: ModerationReport) {
    setTargetStatus(report, "deleted");
    community.patchReport(report.id, {
      status: "resolved",
      resolution: "Content deleted by an administrator.",
      notes: [...report.notes, systemNote("Content deleted. Reporter notified (simulated).")],
    });
    auditStore.log(actor, "content.deleted", `${report.target.type} ${report.target.id} deleted by admin`);
  },
};

/* ───── Members ───── */
export const members = {
  /**
   * Suspend with an EXPLICIT decision about the member's existing public discussions.
   * Nothing is hidden or deleted automatically: "keep" leaves them visible, "hide" hides them.
   */
  suspend(actor: Actor, member: Member, opts: { reason?: string; discussions: "keep" | "hide"; publishedDiscussionIds: string[] }) {
    memberStore.patch(member.id, {
      accountStatus: "suspended",
      suspension: { at: new Date().toISOString(), by: actor.id, reason: opts.reason, discussions: opts.discussions },
    });
    if (opts.discussions === "hide") {
      for (const id of opts.publishedDiscussionIds) {
        community.patchDiscussion(id, { status: "hidden", hiddenReason: "Hidden when the author's account was suspended." });
      }
    }
    auditStore.log(
      actor,
      "member.suspended",
      `${member.displayName} suspended. Existing public discussions: ${opts.discussions === "hide" ? `hidden (${opts.publishedDiscussionIds.length})` : "kept visible"}.${opts.reason ? ` Reason: ${opts.reason}` : ""}`,
    );
  },
  /** Reactivation changes the account only. It does not restore or alter any content. */
  reactivate(actor: Actor, member: Member) {
    memberStore.patch(member.id, { accountStatus: "active", suspension: undefined });
    auditStore.log(actor, "member.reactivated", `${member.displayName} reactivated`);
  },
  setModerator(actor: Actor, member: Member, on: boolean) {
    // Rule: a moderator must have a verified email. Enforced here as well as in the UI.
    if (on && !member.emailVerified) return;
    const roles = on ? [...new Set([...member.roles, "moderator" as const])] : member.roles.filter((r) => r !== "moderator");
    memberStore.patch(member.id, { roles });
    auditStore.log(actor, on ? "member.moderator_added" : "member.moderator_removed", `${member.displayName}: moderator role ${on ? "granted" : "removed"}`);
  },
};

/* ───── Journal ───── */
export const journal = {
  log(actor: Actor, action: string, detail: string) {
    auditStore.log(actor, action, detail);
  },
  patch: cmsStore.patch,
};
