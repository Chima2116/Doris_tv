import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { Pagination } from "@/components/shared/pagination";
import { SectionHeader } from "@/components/shared/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { getArticles, getFeaturedArticle } from "@/data/repositories/articles";
import { ArticleCard, ArticleCover, ArticleMeta } from "@/features/journal/article-card";
import { JOURNAL_CATEGORIES, JOURNAL_PAGE_SIZE } from "@/features/journal/categories";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Interviews, essays, production notes, retrospectives and video conversations about independent African cinema.",
};

export default function JournalPage(props: PageProps<"/journal">) {
  return (
    <>
      <PageContainer as="header" width="wide" className="pb-10 pt-16 sm:pt-24">
        <Eyebrow>DORIS Journal</Eyebrow>
        <h1 className="type-display-lg mt-4 max-w-4xl">The editorial home of African independent film.</h1>
        <p className="mt-5 max-w-xl text-lg text-reading/60">
          Interviews, essays, production notes and conversations that give African cinema the
          attention it deserves.
        </p>
      </PageContainer>
      <Suspense fallback={<JournalSkeleton />}>
        <JournalContent searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function JournalContent({ searchParams }: { searchParams: PageProps<"/journal">["searchParams"] }) {
  const sp = await searchParams;
  const catValue = typeof sp.category === "string" ? sp.category : "";
  const active = JOURNAL_CATEGORIES.find((c) => c.value === catValue) ?? JOURNAL_CATEGORIES[0];
  const requested = Number(typeof sp.page === "string" ? sp.page : "1");
  const isAll = !active.category;

  const [featured, all] = await Promise.all([getFeaturedArticle(), getArticles({ category: active.category })]);

  // "All" view: featured story on top; video conversations get their own section.
  const showFeatured = isAll && featured;
  const videos = isAll ? all.filter((a) => a.category === "Video") : [];
  const list = isAll
    ? all.filter((a) => a.category !== "Video" && a.slug !== featured?.slug)
    : all;

  const totalPages = Math.max(1, Math.ceil(list.length / JOURNAL_PAGE_SIZE));
  const page = Math.min(Math.max(1, Number.isFinite(requested) ? requested : 1), totalPages);
  const pageItems = list.slice((page - 1) * JOURNAL_PAGE_SIZE, page * JOURNAL_PAGE_SIZE);

  return (
    <>
      {showFeatured && page === 1 && (
        <section aria-label="Featured story" className="border-y border-border">
          <PageContainer width="wide" className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
            <Link href={`/journal/${featured.slug}`} className="group relative block overflow-hidden lg:order-2">
              <ArticleCover
                article={featured}
                aspect="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[32rem]"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <span className="absolute left-5 top-5 bg-gold px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-primary-foreground">
                Cover story
              </span>
            </Link>
            <div className="flex flex-col justify-center py-10 lg:order-1 lg:py-16 lg:pr-14">
              <Eyebrow>{featured.category}</Eyebrow>
              <h2 className="type-display-md mt-4">
                <Link href={`/journal/${featured.slug}`} className="hover:text-gold">
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-5 max-w-xl text-reading/65">{featured.deck}</p>
              <ArticleMeta article={featured} className="mt-6" />
              <Link
                href={`/journal/${featured.slug}`}
                className="mt-8 w-fit border-b border-gold pb-0.5 text-xs font-bold uppercase tracking-[0.08em] text-gold"
              >
                Read the interview →
              </Link>
            </div>
          </PageContainer>
        </section>
      )}

      <PageContainer width="wide" className="py-10">
        <nav aria-label="Journal categories" className="-mx-1 overflow-x-auto">
          <ul className="flex min-w-max items-center gap-2 px-1">
            {JOURNAL_CATEGORIES.map((c) => {
              const isActive = c.value === active.value;
              return (
                <li key={c.value}>
                  <Link
                    href={c.value ? `/journal?category=${c.value}` : "/journal"}
                    scroll={false}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
                      isActive
                        ? "border-gold bg-gold text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-white hover:text-foreground",
                    )}
                  >
                    {c.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-12">
          <SectionHeader as="h2" title={isAll ? "Latest writing" : active.label} />
          {pageItems.length === 0 ? (
            <EmptyState
              title="Nothing published here yet"
              description="We're still commissioning stories in this category. Browse everything in the Journal in the meantime."
              action={{ label: "View all stories", href: "/journal" }}
            />
          ) : active.category === "Video" ? (
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((a) => (
                <ArticleCard key={a.id} article={a} variant="video" />
              ))}
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-12">
              {pageItems.map((a, i) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  variant={i === 0 ? "lead" : "standard"}
                  className={cn(
                    i === 0 && "md:col-span-2 lg:col-span-8",
                    i === 1 && "lg:col-span-4",
                    i > 1 && "lg:col-span-4",
                  )}
                />
              ))}
            </div>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/journal"
            params={{ category: active.value || undefined }}
          />
        </div>
      </PageContainer>

      {isAll && videos.length > 0 && (
        <section aria-label="Video conversations" className="border-t border-border bg-[#141414]">
          <PageContainer width="wide" className="py-16">
            <SectionHeader
              as="h2"
              eyebrow="Video conversations"
              title="Conversations on film"
              action={{ label: "All videos", href: "/journal?category=video" }}
            />
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((a) => (
                <ArticleCard key={a.id} article={a} variant="video" />
              ))}
            </div>
            <p className="mt-10 text-sm text-muted-foreground">
              Video conversations open on YouTube or Instagram. DORIS TV does not host playback.
            </p>
          </PageContainer>
        </section>
      )}
    </>
  );
}

function JournalSkeleton() {
  return (
    <PageContainer width="wide" className="py-10">
      <Skeleton className="h-[28rem] w-full" />
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    </PageContainer>
  );
}
