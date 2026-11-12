import { APPLICATIONS } from "@/data/mock/applications";
import type { FilmmakerApplication } from "@/data/types";

export async function getApplications(): Promise<FilmmakerApplication[]> {
  return APPLICATIONS;
}
