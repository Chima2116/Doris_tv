import { cacheLife } from "next/cache";
import { groq } from "next-sanity";
import { sanityClient, sanityConfigured, imageUrl } from "../../../sanity/client";
import type { Filmmaker, VerificationStatus } from "@/data/types";

const FILMMAKERS_QUERY = groq`*[_type == "filmmaker" && publicationStatus == "published" && defined(slug.current)] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  portrait,
  portraitAlt,
  country,
  location,
  primaryDiscipline,
  tagline,
  biography,
  creativePhilosophy,
  activeFrom,
  yearsActive,
  spotlight,
  verificationStatus,
  credits[] { _key, title, year, role, format, runtimeMinutes, description, inProduction },
  links[] { label, url }
}`;

type SanityFilmmaker = {
  _id: string;
  name: string;
  slug: string;
  portrait?: unknown;
  portraitAlt?: string;
  country: string;
  location?: string;
  primaryDiscipline: string;
  tagline?: string;
  biography: string;
  creativePhilosophy?: string;
  activeFrom?: number;
  yearsActive?: string;
  spotlight?: boolean;
  verificationStatus?: VerificationStatus;
  credits?: { _key?: string; title: string; year: number; role: string; format?: string; runtimeMinutes?: number; description?: string; inProduction?: boolean }[];
  links?: { label: string; url: string }[];
};

function toFilmmaker(s: SanityFilmmaker): Filmmaker {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    portraitUrl: s.portrait ? imageUrl(s.portrait, 1200) : "",
    portraitAlt: s.portraitAlt || s.name,
    country: s.country,
    location: s.location,
    primaryDiscipline: s.primaryDiscipline,
    tagline: s.tagline,
    biography: s.biography,
    creativePhilosophy: s.creativePhilosophy,
    activeFrom: s.activeFrom,
    yearsActive: s.yearsActive,
    spotlight: Boolean(s.spotlight),
    verificationStatus: s.verificationStatus ?? "unverified",
    publicationStatus: "published",
    credits: (s.credits ?? []).map((c) => ({
      id: c._key ?? `${c.title}-${c.year}`,
      title: c.title,
      year: c.year,
      role: c.role,
      format: c.format,
      runtimeMinutes: c.runtimeMinutes,
      description: c.description,
      inProduction: Boolean(c.inProduction),
    })),
    links: s.links ?? [],
  };
}

/** Published filmmaker profiles from Sanity. Returns [] when Sanity is not configured or unreachable. */
export async function fetchSanityFilmmakers(): Promise<Filmmaker[]> {
  "use cache";
  cacheLife("minutes");
  if (!sanityConfigured) return [];
  try {
    const rows = await sanityClient.fetch<SanityFilmmaker[]>(FILMMAKERS_QUERY);
    return rows.map(toFilmmaker);
  } catch (err) {
    console.error("Sanity: could not load filmmaker profiles, using local profiles only", err);
    return [];
  }
}
