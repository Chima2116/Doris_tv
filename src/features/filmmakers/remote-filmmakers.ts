import type { Filmmaker, FilmCredit, ExternalLink } from "@/data/types";
import { sessionReady } from "@/lib/supabase/client";

/** Filmmaker profiles stored in Supabase. Ids are prefixed so the admin can tell them apart. */
export const REMOTE_FILMMAKER_PREFIX = "remote_";
export const isRemoteFilmmaker = (id: string) => id.startsWith(REMOTE_FILMMAKER_PREFIX);

type Row = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  portrait_url: string | null;
  country: string;
  location: string | null;
  primary_discipline: string;
  years_active: string | null;
  biography: string;
  creative_philosophy: string | null;
  credits: FilmCredit[] | null;
  links: ExternalLink[] | null;
  status: string;
};

/** Every filmmaker profile, for admins. Row level security limits the list to what the person may see. */
export async function listRemoteFilmmakers(): Promise<Filmmaker[]> {
  const supabase = await sessionReady();
  if (!supabase) return [];
  const [profilesRes, rolesRes] = await Promise.all([
    supabase.from("filmmaker_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id").eq("role", "filmmaker"),
  ]);
  if (profilesRes.error || !profilesRes.data) return [];
  const verified = new Set(((rolesRes.data ?? []) as { user_id: string }[]).map((r) => r.user_id));

  return (profilesRes.data as Row[]).map((f) => ({
    id: `${REMOTE_FILMMAKER_PREFIX}${f.id}`,
    memberId: f.owner_id,
    slug: f.slug,
    name: f.name,
    portraitUrl: f.portrait_url ?? "",
    portraitAlt: f.name,
    country: f.country,
    location: f.location ?? undefined,
    primaryDiscipline: f.primary_discipline,
    yearsActive: f.years_active ?? undefined,
    biography: f.biography,
    creativePhilosophy: f.creative_philosophy ?? undefined,
    credits: f.credits ?? [],
    links: f.links ?? [],
    verificationStatus: verified.has(f.owner_id) ? "verified" : "unverified",
    publicationStatus: f.status === "published" ? "published" : "unpublished",
  }));
}

export async function setRemoteVerified(remoteId: string, verified: boolean): Promise<void> {
  const supabase = await sessionReady();
  if (!supabase) return;
  const { error } = await supabase.rpc("set_filmmaker_verified", {
    _profile_id: remoteId.slice(REMOTE_FILMMAKER_PREFIX.length),
    _verified: verified,
  });
  if (error) throw new Error(error.message);
}

export async function setRemoteListed(remoteId: string, listed: boolean): Promise<void> {
  const supabase = await sessionReady();
  if (!supabase) return;
  const { error } = await supabase.rpc("set_filmmaker_listed", {
    _profile_id: remoteId.slice(REMOTE_FILMMAKER_PREFIX.length),
    _listed: listed,
  });
  if (error) throw new Error(error.message);
}

/** The signed-in person's own filmmaker profile, including one that isn't listed yet. */
export async function getMyFilmmakerProfile(): Promise<Filmmaker | null> {
  const supabase = await sessionReady();
  if (!supabase) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id;
  if (!uid) return null;
  const { data } = await supabase.from("filmmaker_profiles").select("*").eq("owner_id", uid).maybeSingle<Row>();
  if (!data) return null;
  return {
    id: data.id,
    memberId: data.owner_id,
    slug: data.slug,
    name: data.name,
    portraitUrl: data.portrait_url ?? "",
    portraitAlt: data.name,
    country: data.country,
    location: data.location ?? undefined,
    primaryDiscipline: data.primary_discipline,
    yearsActive: data.years_active ?? undefined,
    biography: data.biography,
    creativePhilosophy: data.creative_philosophy ?? undefined,
    credits: data.credits ?? [],
    links: data.links ?? [],
    verificationStatus: "verified",
    publicationStatus: data.status === "published" ? "published" : "unpublished",
  };
}
