import type {
  Filmmaker,
  FilmmakerApplication,
  FilmmakerProfileFields,
  ProfileRevision,
  PublicationStatus,
  VerificationStatus,
} from "@/data/types";
import { filmmakerIdForApplication } from "@/features/applications/applications-store";

/**
 * Pure logic that turns the server-rendered seed filmmakers into what the public (and admin)
 * should currently see: only APPROVED revisions change a published profile, an approved
 * application creates a profile, and admin publication/verification patches apply on top.
 */
export type FilmmakerAdminPatch = { publicationStatus?: PublicationStatus; verificationStatus?: VerificationStatus };

export const slugify = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** The most recently approved revision's fields, if any. */
export function latestApprovedFields(filmmakerId: string, revisions: ProfileRevision[]): FilmmakerProfileFields | undefined {
  return revisions
    .filter((r) => r.filmmakerId === filmmakerId && r.status === "approved")
    .sort((a, b) => (b.decidedAt ?? "").localeCompare(a.decidedAt ?? ""))[0]?.proposed;
}

export function filmmakerFromApplication(app: FilmmakerApplication): Filmmaker {
  const d = app.details;
  return {
    id: filmmakerIdForApplication(app.id),
    slug: slugify(d.fullName),
    name: d.fullName,
    portraitUrl: "",
    portraitAlt: `Portrait of ${d.fullName}`,
    country: d.country,
    location: d.city,
    primaryDiscipline: d.primaryDiscipline,
    biography: d.biography,
    creativePhilosophy: d.creativePhilosophy,
    yearsActive: d.yearsActive,
    activeFrom: Number(d.yearsActive?.match(/\d{4}/)?.[0]) || undefined,
    credits: d.credits,
    links: d.links,
    verificationStatus: "verified",
    publicationStatus: "published",
    memberId: app.applicantId,
  };
}

export function buildFilmmakers({
  seed,
  applications,
  revisions,
  patches,
}: {
  seed: Filmmaker[];
  applications: FilmmakerApplication[];
  revisions: ProfileRevision[];
  patches: Record<string, FilmmakerAdminPatch>;
}): Filmmaker[] {
  const seedIds = new Set(seed.map((f) => f.id));
  const derived = applications
    .filter((a) => a.status === "approved")
    .map(filmmakerFromApplication)
    .filter((f) => !seedIds.has(f.id));

  return [...seed, ...derived].map((f) => {
    const approved = latestApprovedFields(f.id, revisions);
    const merged: Filmmaker = approved
      ? {
          ...f,
          ...approved,
          activeFrom: Number(approved.yearsActive?.match(/\d{4}/)?.[0]) || f.activeFrom,
          portraitAlt: `Portrait of ${approved.name}`,
        }
      : f;
    return { ...merged, ...patches[f.id] };
  });
}

export const publicFilmmakers = (all: Filmmaker[]) =>
  all.filter((f) => f.publicationStatus === "published").sort((a, b) => a.name.localeCompare(b.name));
