import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { ArtImage } from "@/components/shared/art-image";
import { Eyebrow } from "@/components/shared/eyebrow";
import { formatShortDate, readingLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { JournalArticle } from "@/data/types";

type Variant = "lead" | "standard" | "compact" | "video";

export function ArticleMeta({ article, className }: { article: JournalArticle; className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      <span className="font-medium text-foreground/80">{article.author}</span>
      <span aria-hidden="true"> · </span>
      <time dateTime={article.publishedAt}>{formatShortDate(article.publishedAt)}</time>
      <span aria-hidden="true"> · </span>
      {readingLabel(article)}
    </p>
  );
}

export function ArticleCover({
  article,
  aspect,
  className,
  priority,
  sizes,
}: {
  article: JournalArticle;
  aspect: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <ArtImage
      src={article.coverImage || undefined}
      alt={article.coverAlt}
      seed={article.slug}
      ghost={article.category.slice(0, 1)}
      aspect={aspect}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}

/**
 * Journal card with four editorial treatments so the grid isn't a wall of
 * identical tiles: lead (large), standard, compact (text row), video (link-out).
 */
export function ArticleCard({
  article,
  variant = "standard",
  index,
  className,
}: {
  article: JournalArticle;
  variant?: Variant;
  index?: number;
  className?: string;
}) {
  const href = `/journal/${article.slug}`;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex gap-5 border-t border-border py-5 transition-colors hover:bg-white/[0.02]",
          className,
        )}
      >
        {index !== undefined && (
          <span aria-hidden="true" className="font-display text-3xl font-black text-white/15 group-hover:text-gold/60">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        <span className="block">
          <Eyebrow className="mb-1.5">{article.category}</Eyebrow>
          <span className="block font-display text-lg font-black leading-snug group-hover:text-gold">
            {article.title}
          </span>
          <ArticleMeta article={article} className="mt-2" />
        </span>
      </Link>
    );
  }

  const isLead = variant === "lead";
  const isVideo = variant === "video";

  return (
    <article className={cn("group relative", className)}>
      <Link href={href} className="block">
        <div className="relative overflow-hidden">
          <ArticleCover
            article={article}
            aspect={isLead ? "aspect-[16/10]" : isVideo ? "aspect-video" : "aspect-[4/3]"}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            sizes={isLead ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          />
          {isVideo && (
            <>
              <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <span className="flex size-14 items-center justify-center bg-gold text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                  <Play className="size-5 fill-current" />
                </span>
              </span>
              {article.video && (
                <span className="absolute right-3 top-3 bg-background/80 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-foreground/80">
                  {article.video.platform} · {article.video.runtimeMinutes} min
                </span>
              )}
            </>
          )}
        </div>
        <div className={cn("pt-5", isLead && "md:pt-6")}>
          <Eyebrow className="mb-2.5">{article.category}</Eyebrow>
          <h3
            className={cn(
              "font-display font-black leading-[1.15] text-balance transition-colors group-hover:text-gold",
              isLead ? "text-2xl md:text-4xl" : "text-lg md:text-xl",
            )}
          >
            {article.title}
            {isVideo && <ArrowUpRight className="ml-1 inline size-4 text-muted-foreground" aria-hidden="true" />}
          </h3>
          {article.deck && (
            <p className={cn("mt-3 text-reading/60", isLead ? "max-w-2xl text-base" : "line-clamp-3 text-sm")}>
              {article.deck}
            </p>
          )}
          <ArticleMeta article={article} className="mt-4" />
        </div>
      </Link>
    </article>
  );
}
