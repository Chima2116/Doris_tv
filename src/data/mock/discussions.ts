import type { Discussion } from "@/data/types";

export const DISCUSSION_CATEGORIES = [
  "General",
  "Festivals",
  "Craft",
  "Recommendations",
  "Distribution",
  "Industry",
] as const;

// Sample discussions removed. Discussions are created by members.
export const DISCUSSIONS: Discussion[] = [];
