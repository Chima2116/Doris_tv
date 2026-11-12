import type { JournalCategory } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * Temporary cover for a Journal story that has no photograph yet. It is an honest, typographic
 * plate (category tone, large label, "Cover image to be supplied"), never a stock picture or a
 * grey block. Replace with a real <Photo> when the story's image arrives
 * (see docs/ASSET-REQUIREMENTS.md).
 */
const TONES: Record<JournalCategory, { bg: string; fg: string; sub: string }> = {
  Interview: { bg: "bg-paper", fg: "text-ink", sub: "text-ink/55" },
  Essay: { bg: "bg-[#1c1c1c]", fg: "text-white", sub: "text-white/50" },
  "Production Notes": { bg: "bg-[#2b2620]", fg: "text-white", sub: "text-white/50" },
  Retrospective: { bg: "bg-[#1b2226]", fg: "text-white", sub: "text-white/50" },
  Video: { bg: "bg-black ring-1 ring-inset ring-white/15", fg: "text-white", sub: "text-white/50" },
};

export function StoryCover({ category, className, children }: { category: JournalCategory; className?: string; children?: React.ReactNode }) {
  const t = TONES[category];
  return (
    <div className={cn("relative flex flex-col justify-between overflow-hidden p-5 transition-transform duration-500 ease-out group-hover:scale-[1.015]", t.bg, t.fg, className)}>
      <p className="tag">{category === "Video" ? "Video conversation" : category}</p>
      {children}
      <p className={cn("text-[0.6875rem] font-medium", t.sub)}>Cover image to be supplied</p>
    </div>
  );
}
