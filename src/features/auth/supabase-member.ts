import type { Member, MemberRole } from "@/data/types";
import { getSupabase } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  location: string | null;
  profile_visibility: "public" | "private";
  created_at: string;
};

/**
 * Loads the signed-in person's member record from Supabase: their profile plus their roles.
 * Row level security means this only ever returns the person's own roles.
 */
export async function loadSupabaseMember(userId: string): Promise<Member | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const [profileRes, rolesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, bio, location, profile_visibility, created_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const profile = profileRes.data as ProfileRow | null;
  const roles = rolesRes.data;
  if (!profile) return null;

  const roleNames = (roles ?? []).map((r: { role: string }) => r.role as MemberRole);
  return {
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
  };
}

/**
 * Every member in Supabase, for the admin Members page. Row level security only allows this for
 * administrators and moderators; for anyone else it returns an empty list.
 */
export async function listSupabaseMembers(): Promise<Member[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const [profilesRes, rolesRes] = await Promise.all([
    supabase.from("profiles").select("id, username, display_name, bio, location, profile_visibility, created_at").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  if (profilesRes.error || !profilesRes.data) return [];
  const rolesByUser = new Map<string, MemberRole[]>();
  for (const r of (rolesRes.data ?? []) as { user_id: string; role: string }[]) {
    rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role as MemberRole]);
  }
  return (profilesRes.data as ProfileRow[]).map((profile) => {
    const roleNames = rolesByUser.get(profile.id) ?? [];
    return {
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
    };
  });
}
