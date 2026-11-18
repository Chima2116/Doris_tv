import { Photo } from "@/components/shared/photo";
import { ExternalLink } from "lucide-react";
import type { ArticleBlock } from "@/data/types";
import { videoEmbedUrl, videoPlatform } from "@/lib/video";

/** A video that plays on the page. Links that can't be embedded fall back to opening on their platform. */
export function VideoLinkCard({ url }: { url: string }) {
  const embed = videoEmbedUrl(url);
  const platform = videoPlatform(url);
  if (!embed) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="my-10 flex items-center justify-between gap-6 border border-white/15 bg-surface p-6 transition-colors duration-200 hover:border-gold/60">
        <span className="font-display text-xl font-black">Watch on {platform}</span>
        <ExternalLink className="size-5 shrink-0 text-gold" aria-hidden="true" />
      </a>
    );
  }
  return (
    <figure className="my-10 -mx-5 sm:-mx-6 lg:-mx-24">
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          src={embed}
          title={`Video on ${platform}`}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <figcaption className="mt-3 px-5 text-sm text-muted-foreground sm:px-6 lg:px-0">
        Video on {platform}.{" "}
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-gold">Open on {platform}</a>
      </figcaption>
    </figure>
  );
}

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
              <h2 key={i} className="heading-section pt-6">
                {b.text}
              </h2>
            );
          case "quote":
            return (
              <blockquote key={i} className="my-10 border-l-2 border-white/40 py-1 pl-6 sm:pl-8">
                <p className="text-2xl font-bold leading-snug tracking-tight text-balance sm:text-3xl">
                  “{b.text}”
                </p>
                {b.cite && (
                  <footer className="mt-3 tag text-white/60">
                    {b.cite}
                  </footer>
                )}
              </blockquote>
            );
          case "video":
            return <VideoLinkCard key={i} url={b.url} />;
          case "image":
            return (
              <figure key={i} className="-mx-5 my-10 sm:-mx-6 lg:-mx-24">
                <Photo
                  asset={b.src ? { src: b.src, alt: b.alt, caption: b.caption ?? "", focal: "50% 50%" } : undefined}
                  alt={b.alt}
                  ratio="16/9"
                  sizes="(min-width: 1024px) 60vw, 100vw"
                />
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
