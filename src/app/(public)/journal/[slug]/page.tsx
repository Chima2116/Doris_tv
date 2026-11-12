import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import {
  getArticleBySlug,
  getArticleSlugs,
  getRelatedArticles,
} from "@/data/repositories/articles";
import { getFilmmakerBySlug } from "@/data/repositories/filmmakers";
import { Photo, PhotoCredit } from "@/components/shared/photo";
import { ArticleCard } from "@/features/journal/article-card";
import { articleImage } from "@/features/journal/article-image";
import { ArticleBody } from "@/features/journal/article-body";
import { ShareButtons } from "@/features/journal/share-buttons";
import { SaveButton } from "@/features/members/save-button";
import { formatDate, readingLabel } from "@/lib/format";

export async function generateStaticParams() {
  return (await getArticleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Story not found" };
  return {
    title: article.title,
    description: article.deck,
    openGraph: { title: article.title, description: article.deck, type: "article" },
  };
}

export default function ArticlePage(props: PageProps<"/journal/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleContent params={props.params} />
    </Suspense>
  );
}

function ArticleSkeleton() {
  return (
    <PageContainer width="narrow" className="pt-14">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-24 w-full" />
      <Skeleton className="mt-8 h-72 w-full" />
    </PageContainer>
  );
}

async function ArticleContent({ params }: { params: PageProps<"/journal/[slug]">["params"] }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [related, people] = await Promise.all([
    getRelatedArticles(article, 3),
    Promise.all((article.filmmakerSlugs ?? []).map((s) => getFilmmakerBySlug(s))),
  ]);
  const filmmakers = people.filter((f): f is NonNullable<typeof f> => !!f);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.deck,
    author: { "@type": "Person", name: article.author },
    datePublished: article.publishedAt,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {(() => {
        const asset = articleImage(article.slug);
        const catSlug = { Interview: "interviews", Essay: "essays", "Production Notes": "production-notes", Retrospective: "retrospectives", Video: "video" }[article.category];
        const head = (
          <div className="mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
            <nav aria-label="Breadcrumb" className="tag mb-6 text-white/70">
              <Link href="/journal" className="hover:text-white">Journal</Link>
              <span aria-hidden="true"> / </span>
              <Link href={`/journal?category=${catSlug}`} className="text-white hover:underline">{article.category}</Link>
            </nav>
            <h1 className="display-name max-w-[22ch] text-[clamp(2rem,5vw,4rem)] leading-[1.05]">{article.title}</h1>
            {article.deck && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">{article.deck}</p>}
            <p className="meta mt-6 text-white/65">
              By <span className="font-semibold text-white">{article.author}</span>
              <span aria-hidden="true"> · </span>
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              <span aria-hidden="true"> · </span>
              {readingLabel(article)}
            </p>
          </div>
        );
        return asset ? (
          <header className="relative isolate flex min-h-[32rem] items-end pb-12 pt-40 lg:min-h-[40rem]">
            <Photo asset={asset} fill priority sizes="100vw" className="-z-20" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            {head}
            <PhotoCredit asset={asset} className="absolute bottom-3 right-5 hidden max-w-[24rem] text-right text-white/55 lg:block" />
          </header>
        ) : (
          <header className="bg-[#1c1c1c] pb-12 pt-14 sm:pt-20">{head}</header>
        );
      })()}

      <PageContainer width="narrow" className="pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
          <p className="meta text-white/55">Share or save this story</p>
          <div className="flex gap-2">
            <SaveButton slug={article.slug} />
            <ShareButtons title={article.title} path={`/journal/${article.slug}`} />
          </div>
        </div>
      </PageContainer>

      <PageContainer width="narrow" className="py-12">
        {article.video && (
          <div className="mb-10 bg-[#1c1c1c] p-6">
            <p className="tag text-white/60">Video conversation · {article.video.runtimeMinutes} min</p>
            <p className="mt-3 text-reading/80">
              This conversation lives on {article.video.platform}. DORIS TV links out rather than
              hosting playback.
            </p>
            <Button asChild className="mt-5">
              <a href={article.video.url} target="_blank" rel="noopener noreferrer">
                Watch on {article.video.platform} <ExternalLink aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
          </div>
        )}
        {article.body && <ArticleBody blocks={article.body} />}

        {article.authorBio && (
          <aside className="mt-14 border-t border-border pt-8" aria-label="About the author">
            <p className="tag text-white/60">About the author</p>
            <p className="mt-2 font-semibold">{article.author}</p>
            <p className="mt-1 text-sm text-muted-foreground">{article.authorBio}</p>
          </aside>
        )}

        {filmmakers.length > 0 && (
          <aside className="mt-10" aria-label="Filmmakers in this story">
            <p className="tag text-white/60">In this story</p>
            <ul className="mt-3 flex flex-wrap gap-3">
              {filmmakers.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/filmmakers/${f.slug}`}
                    className="inline-flex flex-col border border-border px-4 py-3 transition-colors hover:border-white"
                  >
                    <span className="heading-card text-base">{f.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {f.primaryDiscipline} · {f.country}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </PageContainer>

      {related.length > 0 && (
        <section className="border-t border-border bg-[#141414]" aria-label="Related stories">
          <PageContainer width="wide" className="py-16">
            <SectionHeader title="Related stories" eyebrow="Keep reading" />
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} variant={a.category === "Video" ? "video" : "standard"} />
              ))}
            </div>
          </PageContainer>
        </section>
      )}
    </article>
  );
}
