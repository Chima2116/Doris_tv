import type { ApplicationDetails, ApplicationStatus, FilmmakerApplication } from "@/data/types";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Filmmaker applications stored in Supabase. The database decides who may submit, read and decide
 * (see supabase/migrations/0002_application_decisions.sql). Everything here is a no-op when
 * Supabase isn't configured, so the prototype still works without it.
 */

type Row = {
  id: string;
  applicant_id: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  details: ApplicationDetails;
  decision_reason: string | null;
  submitted_at: string | null;
  decided_at: string | null;
  created_at: string;
};

/** Remote application ids are prefixed so the admin can tell them apart from local ones. */
export const REMOTE_PREFIX = "remote_";
export const isRemoteApplication = (id: string) => id.startsWith(REMOTE_PREFIX);

const toStatus = (s: Row["status"]): ApplicationStatus => (s === "submitted" ? "submitted" : s);

function toApplication(r: Row): FilmmakerApplication {
  return {
    id: `${REMOTE_PREFIX}${r.id}`,
    applicantId: r.applicant_id,
    createdAt: r.created_at,
    status: toStatus(r.status),
    details: r.details,
    submittedAt: r.submitted_at ?? undefined,
    decidedAt: r.decided_at ?? undefined,
    decisionReason: r.decision_reason ?? undefined,
    history: [{ status: toStatus(r.status), at: r.decided_at ?? r.submitted_at ?? r.created_at }],
  };
}

/** Sends the applicant's application for review. Throws with a readable message on failure. */
export async function submitRemoteApplication(details: ApplicationDetails): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.rpc("submit_application", { _details: details });
  if (error) throw new Error(error.message);
}

/** Every application an admin can see (or the applicant's own, for them). */
export async function listRemoteApplications(): Promise<FilmmakerApplication[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("filmmaker_applications")
    .select("id, applicant_id, status, details, decision_reason, submitted_at, decided_at, created_at")
    .neq("status", "draft")
    .order("submitted_at", { ascending: false });
  if (error) return [];
  return ((data ?? []) as Row[]).map(toApplication);
}

export async function approveRemoteApplication(remoteId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.rpc("approve_application", { _application_id: remoteId.slice(REMOTE_PREFIX.length) });
  if (error) throw new Error(error.message);
}

export async function declineRemoteApplication(remoteId: string, reason: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.rpc("decline_application", {
    _application_id: remoteId.slice(REMOTE_PREFIX.length),
    _reason: reason,
  });
  if (error) throw new Error(error.message);
}
