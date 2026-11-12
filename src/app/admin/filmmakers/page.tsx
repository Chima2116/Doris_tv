import type { Metadata } from "next";
import { getApplications } from "@/data/repositories/applications";
import { getAllFilmmakers } from "@/data/repositories/filmmakers";
import { FilmmakersAdmin } from "@/features/admin/filmmakers-admin";

// Role-gated on the client (simulated), so children aren't rendered for ineligible users.
export const instant = false;

export const metadata: Metadata = { title: "Filmmakers" };

export default async function Page() {
  const [seed, apps] = await Promise.all([getAllFilmmakers(), getApplications()]);
  return <FilmmakersAdmin seed={seed} seedApplications={apps} />;
}
