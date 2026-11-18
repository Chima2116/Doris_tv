import type { Filmmaker, FilmCredit, Member, MemberRole } from "@/data/types";
import { getPublicSupabase } from "@/lib/supabase/public";

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  location: string | null;
  profile_visibility: "public" | "private";
  created_at: string;
};

type FilmmakerRow = {
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
  links: Filmmaker["links"] | null;
};

const toFilmmaker = (f: FilmmakerRow): Filmmaker => ({
  id: f.id,
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
  verificationStatus: "verified",
  publicationStatus: "published",
});

/**
 * Public profile for a member who signed up through Supabase, with their published filmmaker
 * profile when they have one. Returns null when there is no such member.
 */
export async function getRemoteMemberByUsername(
  username: string,
): Promise<{ member: Member; filmmaker: Filmmaker | null } | null> {
  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, location, profile_visibility, created_at")
    .eq("username", username)
    .maybeSingle<ProfileRow>();
  if (!profile) return null;

  const [{ data: roles }, { data: fm }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", profile.id),
    supabase
      .from("filmmaker_profiles")
      .select("*")
      .eq("owner_id", profile.id)
      .eq("status", "published")
      .maybeSingle<FilmmakerRow>(),
  ]);

  const roleNames = (roles ?? []).map((r: { role: string }) => r.role as MemberRole);
  const filmmaker = fm ? toFilmmaker(fm) : null;
  const member: Member = {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    bio: profile.bio ?? undefined,
    location: profile.location ?? undefined,
    memberSince: profile.created_at,
    roles: roleNames.includes("member") ? roleNames : (["member", ...roleNames] as MemberRole[]),
    accountStatus: "active",
    emailVerified: true,
    profileVisibility: profile.profile_visibility,
    privacy: { visibility: profile.profile_visibility, hiddenSections: [] },
    filmmakerId: filmmaker?.id,
  };
  return { member, filmmaker };
}
