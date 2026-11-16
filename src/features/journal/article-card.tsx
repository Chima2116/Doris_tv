import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Photo } from "@/components/shared/photo";
import { formatShortDate, readingLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { JournalArticle } from "@/data/types";
import { articleImage } from "./article-image";
import { StoryCover } from "./story-cover";

type Variant = "lead" | "standard" | "compact" | "video";

export function ArticleMeta({ article, className }: { article: JournalArticle; className?: string }) {
  return (
    <p className={cn("meta text-white/55", className)}>
      <span className="text-white/80">{article.author}</span>
      <span aria-hidden="true"> · </span>
      <time dateTime={article.publishedAt}>{formatShortDate(article.publishedAt)}</time>
      <span aria-hidden="true"> · </span>
      {readingLabel(article)}
    </p>
  );
}

/**
 * Journal card. Four treatments so a list is never a wall of identical tiles:
 * lead (wide), standard (portrait), compact (text row), video (link-out).
 * Stories with a real photograph show it; the rest show a labelled cover plate that carries the title.
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
  const asset = articleImage(article);

  if (variant === "compact") {
    return (
      <Link href={href} className={cn("group grid grid-cols-[2.25rem_1fr] gap-x-3 border-t border-white/20 py-5", className)}>
        <span className="meta tabular-nums text-white/60">[{(index ?? 0) + 1}]</span>
        <span>
          <span className="tag block text-gold">{article.category}</span>
          <span className="heading-card mt-2 block text-lg leading-snug transition-colors duration-200 group-hover:text-gold">{article.title}</span>
          <ArticleMeta article={article} className="mt-2" />
        </span>
      </Link>
    );
  }

  const isLead = variant === "lead";
  const isVideo = variant === "video";
  const ratio = isLead ? "aspect-[16/10]" : isVideo ? "aspect-video" : "aspect-[4/5]";

  return (
    <article className={cn("group", className)}>
      <Link href={href} className="block">
        {asset ? (
          <Photo asset={asset} ratio={isLead ? "16/10" : "4/5"} sizes={isLead ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"} imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        ) : (
          <StoryCover category={article.category} className={ratio}>
            <div>
              <h3 className={cn("heading-card leading-snug", isLead ? "text-[clamp(1.5rem,3vw,2.25rem)]" : "text-[1.1875rem]")}>{article.title}</h3>
              {isVideo && (
                <p className="meta mt-4 inline-flex items-center gap-2 text-white/80">
                  <Play className="size-3.5 fill-current" aria-hidden="true" />
                  {article.video?.platform} · {article.video?.runtimeMinutes} min
                </p>
              )}
            </div>
          </StoryCover>
        )}
        <div className="pt-4">
          {asset && (
            <>
              <p className="tag text-gold">{article.category}</p>
              <h3 className={cn("heading-card mt-2 leading-snug transition-colors duration-200 group-hover:text-gold", isLead ? "text-[clamp(1.5rem,3vw,2.25rem)]" : "text-[1.1875rem]")}>
                {article.title}
              </h3>
            </>
          )}
          {isLead && article.deck && <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">{article.deck}</p>}
          <ArticleMeta article={article} className={asset ? "mt-3" : ""} />
          {!asset && (
            <span className="meta mt-2 inline-flex items-center gap-1.5 text-white/80">
              {isVideo ? "Watch" : "Read"}
              <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
