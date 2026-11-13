import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselItem } from "@/components/shared/carousel";
import { Photo } from "@/components/shared/photo";
import { PageContainer } from "@/components/shared/page-container";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { getArticles, getFeaturedArticle } from "@/data/repositories/articles";
import { ArticleCard, ArticleMeta } from "@/features/journal/article-card";
import { articleImage } from "@/features/journal/article-image";
import { StoryCover } from "@/features/journal/story-cover";
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
      <PageContainer as="header" width="wide" className="pb-8 pt-14 sm:pt-20">
        <p className="tag text-white/60">The Journal</p>
        <h1 className="display-name mt-4 max-w-[18ch] text-[clamp(2.25rem,5.5vw,4.5rem)]">The editorial home of African independent film.</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          Interviews, essays, production notes and conversations that give African cinema the attention it deserves.
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

  // "All" view: featured story on top; video conversations get their own rail.
  const showFeatured = isAll && featured;
  const videos = isAll ? all.filter((a) => a.category === "Video") : [];
  const list = isAll ? all.filter((a) => a.category !== "Video" && a.slug !== featured?.slug) : all;

  const totalPages = Math.max(1, Math.ceil(list.length / JOURNAL_PAGE_SIZE));
  const page = Math.min(Math.max(1, Number.isFinite(requested) ? requested : 1), totalPages);
  const pageItems = list.slice((page - 1) * JOURNAL_PAGE_SIZE, page * JOURNAL_PAGE_SIZE);
  const featuredImage = featured ? articleImage(featured.slug) : undefined;

  return (
    <>
      <PageContainer width="wide" className="pb-8">
        <nav aria-label="Journal categories" className="-mx-1 overflow-x-auto">
          <ul className="flex min-w-max items-center gap-7 border-b border-white/15 px-1">
            {JOURNAL_CATEGORIES.map((c) => {
              const isActive = c.value === active.value;
              return (
                <li key={c.value}>
                  <Link
                    href={c.value ? `/journal?category=${c.value}` : "/journal"}
                    scroll={false}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "-mb-px block border-b-2 py-3 text-sm font-semibold transition-colors duration-200",
                      isActive ? "border-gold text-gold" : "border-transparent text-white/60 hover:border-gold/50 hover:text-gold",
                    )}
                  >
                    {c.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </PageContainer>

      {showFeatured && page === 1 && (
        <section aria-label="Featured story" className="grid lg:grid-cols-12">
          <div className="group relative min-h-[20rem] lg:col-span-7 lg:min-h-[34rem]">
            {featuredImage ? (
              <Photo asset={featuredImage} fill priority sizes="(min-width: 1024px) 58vw, 100vw" imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            ) : (
              <StoryCover category={featured.category} className="absolute inset-0" />
            )}
            <Link href={`/journal/${featured.slug}`} aria-label={featured.title} className="absolute inset-0" />
          </div>
          <div className="flex flex-col justify-center bg-[#1c1c1c] px-6 py-12 sm:px-10 lg:col-span-5 lg:px-14">
            <p className="tag text-gold">Cover story · {featured.category}</p>
            <h2 className="heading-feature mt-4 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1]">
              <Link href={`/journal/${featured.slug}`} className="hover:underline hover:decoration-white/40 hover:underline-offset-[6px]">{featured.title}</Link>
            </h2>
            {featured.deck && <p className="mt-5 max-w-[30rem] text-base leading-relaxed text-white/70">{featured.deck}</p>}
            <ArticleMeta article={featured} className="mt-6" />
            <Button asChild variant="outline" className="mt-8 w-fit">
              <Link href={`/journal/${featured.slug}`}>Read the story <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
        </section>
      )}

      <PageContainer width="wide" className="py-14 sm:py-20">
        <h2 className="heading-card mb-8 text-xl">{isAll ? "Latest writing" : active.label}</h2>
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
                className={cn(i === 0 ? "md:col-span-2 lg:col-span-8" : "lg:col-span-4")}
              />
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} basePath="/journal" params={{ category: active.value || undefined }} />
      </PageContainer>

      {isAll && videos.length > 0 && (
        <section aria-label="Video conversations" className="bg-[#141414] py-16 sm:py-20">
          <PageContainer width="wide">
            <div className="mb-6 flex items-end justify-between gap-6">
              <div>
                <p className="tag text-gold">Video conversations</p>
                <h2 className="heading-section mt-3">Conversations on film</h2>
              </div>
              <Link href="/journal?category=video" className="hidden items-center gap-2 text-sm font-semibold text-white/80 hover:text-white sm:inline-flex">
                All videos <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <Carousel label="Video conversations">
              {videos.map((a) => (
                <CarouselItem key={a.id} className="w-[82vw] sm:w-[24rem]">
                  <ArticleCard article={a} variant="video" />
                </CarouselItem>
              ))}
            </Carousel>
            <p className="mt-8 text-sm text-white/55">
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
