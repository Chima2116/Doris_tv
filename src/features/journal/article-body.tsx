import { ArtImage } from "@/components/shared/art-image";
import type { ArticleBlock } from "@/data/types";

/** Reading-first body renderer: generous measure, warm reading colour, pull quotes in gold. */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="space-y-7">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return (
              <p key={i} className="text-[1.125rem] leading-[1.85] text-reading sm:text-[1.1875rem]">
                {b.text}
              </p>
            );
          case "h2":
            return (
              <h2 key={i} className="type-display-md pt-6">
                {b.text}
              </h2>
            );
          case "quote":
            return (
              <blockquote key={i} className="my-10 border-l-4 border-gold py-1 pl-6 sm:pl-8">
                <p className="font-display text-2xl font-black leading-snug text-balance sm:text-3xl">
                  “{b.text}”
                </p>
                {b.cite && (
                  <footer className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {b.cite}
                  </footer>
                )}
              </blockquote>
            );
          case "image":
            return (
              <figure key={i} className="-mx-5 my-10 sm:-mx-6 lg:-mx-24">
                <ArtImage alt={b.alt} seed={b.seed ?? b.alt} aspect="aspect-[16/9]" sizes="(min-width: 1024px) 60vw, 100vw" />
                {b.caption && (
                  <figcaption className="mt-3 px-5 text-sm text-muted-foreground sm:px-6 lg:px-0">
                    {b.caption}
                  </figcaption>
                )}
              </figure>
            );
        }
      })}
    </div>
  );
}
