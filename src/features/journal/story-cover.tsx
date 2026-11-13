import type { JournalCategory } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * Temporary cover for a Journal story that has no photograph yet. It is an honest, typographic
 * plate (category tone, large label, "Cover image to be supplied"), never a stock picture or a
 * grey block. Replace with a real <Photo> when the story's image arrives
 * (see docs/ASSET-REQUIREMENTS.md).
 */
/** Gold tags only on dark tiles: gold on the cream tile fails contrast (1.8:1), so it uses ink there. */
const TONES: Record<JournalCategory, { bg: string; fg: string; sub: string; tag: string }> = {
  Interview: { bg: "bg-paper", fg: "text-ink", sub: "text-ink/65", tag: "text-ink" },
  Essay: { bg: "bg-[#1c1c1c]", fg: "text-white", sub: "text-white/55", tag: "text-gold" },
  "Production Notes": { bg: "bg-[#2b2620]", fg: "text-white", sub: "text-white/55", tag: "text-gold" },
  Retrospective: { bg: "bg-[#1b2226]", fg: "text-white", sub: "text-white/55", tag: "text-gold" },
  Video: { bg: "bg-black ring-1 ring-inset ring-white/15", fg: "text-white", sub: "text-white/55", tag: "text-gold" },
};

export function StoryCover({ category, className, children }: { category: JournalCategory; className?: string; children?: React.ReactNode }) {
  const t = TONES[category];
  return (
    <div className={cn("relative flex flex-col justify-between overflow-hidden p-5 transition-transform duration-500 ease-out group-hover:scale-[1.015]", t.bg, t.fg, className)}>
      <p className={cn("tag", t.tag)}>{category === "Video" ? "Video conversation" : category}</p>
      {children}
      <p className={cn("text-[0.6875rem] font-medium", t.sub)}>Cover image to be supplied</p>
    </div>
  );
}
