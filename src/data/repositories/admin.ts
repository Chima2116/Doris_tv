import { REPORTS } from "@/data/mock/reports";
import { ARTICLES } from "@/data/mock/articles";
import type { JournalArticle, ModerationReport } from "@/data/types";

export async function getReports(): Promise<ModerationReport[]> {
  return REPORTS;
}

/** Every article regardless of status (drafts and scheduled included), for the CMS. */
export async function getAllArticles(): Promise<JournalArticle[]> {
  return ARTICLES;
}
