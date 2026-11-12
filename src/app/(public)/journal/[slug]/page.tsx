import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import {
  getArticleBySlug,
  getArticleSlugs,
  getRelatedArticles,
} from "@/data/repositories/articles";
import { getFilmmakerBySlug } from "@/data/repositories/filmmakers";
import { ArticleCard, ArticleCover } from "@/features/journal/article-card";
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
      <PageContainer width="narrow" className="pt-10 sm:pt-14">
        <nav aria-label="Breadcrumb" className="mb-8 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <Link href="/journal" className="hover:text-foreground">
            Journal
          </Link>
          <span aria-hidden="true"> / </span>
          <Link
            href={`/journal?category=${
              { Interview: "interviews", Essay: "essays", "Production Notes": "production-notes", Retrospective: "retrospectives", Video: "video" }[article.category]
            }`}
            className="text-gold hover:underline"
          >
            {article.category}
          </Link>
        </nav>
        <header>
          <Eyebrow>{article.category}</Eyebrow>
          <h1 className="type-display-lg mt-4 !text-[clamp(2rem,5vw,3.5rem)]">{article.title}</h1>
          {article.deck && <p className="mt-6 text-xl leading-relaxed text-reading/70">{article.deck}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <p className="text-sm text-muted-foreground">
              By <span className="font-semibold text-foreground">{article.author}</span>
              <span aria-hidden="true"> · </span>
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              <span aria-hidden="true"> · </span>
              {readingLabel(article)}
            </p>
            <div className="flex gap-2">
              <SaveButton slug={article.slug} />
              <ShareButtons title={article.title} path={`/journal/${article.slug}`} />
            </div>
          </div>
        </header>
      </PageContainer>

      <PageContainer width="wide" className="mt-10">
        <ArticleCover article={article} aspect="aspect-[16/9] lg:aspect-[21/9]" priority sizes="100vw" />
      </PageContainer>

      <PageContainer width="narrow" className="py-12">
        {article.video && (
          <div className="mb-10 border border-border bg-surface p-6">
            <Eyebrow>Video conversation · {article.video.runtimeMinutes} min</Eyebrow>
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
            <Eyebrow tone="muted">About the author</Eyebrow>
            <p className="mt-2 font-semibold">{article.author}</p>
            <p className="mt-1 text-sm text-muted-foreground">{article.authorBio}</p>
          </aside>
        )}

        {filmmakers.length > 0 && (
          <aside className="mt-10" aria-label="Filmmakers in this story">
            <Eyebrow tone="muted">In this story</Eyebrow>
            <ul className="mt-3 flex flex-wrap gap-3">
              {filmmakers.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/filmmakers/${f.slug}`}
                    className="inline-flex flex-col border border-border px-4 py-3 transition-colors hover:border-gold"
                  >
                    <span className="font-display text-base font-black">{f.name}</span>
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
