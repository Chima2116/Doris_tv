import type { JournalCategory } from "@/data/types";

export const JOURNAL_CATEGORIES: { value: string; label: string; category?: JournalCategory }[] = [
  { value: "", label: "All" },
  { value: "interviews", label: "Interviews", category: "Interview" },
  { value: "essays", label: "Essays", category: "Essay" },
  { value: "production-notes", label: "Production Notes", category: "Production Notes" },
  { value: "retrospectives", label: "Retrospectives", category: "Retrospective" },
  { value: "video", label: "Video", category: "Video" },
];

export const JOURNAL_PAGE_SIZE = 6;
