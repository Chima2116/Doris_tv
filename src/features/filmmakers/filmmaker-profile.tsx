"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import type { Filmmaker, FilmmakerApplication, JournalArticle } from "@/data/types";
import { ArticleCard } from "@/features/journal/article-card";
import { FollowButton } from "@/features/members/follow-button";
import { followId } from "@/features/members/follow-id";
import { FilmmakerPortrait } from "./filmmaker-card";
import { useFilmmakers } from "./use-public-filmmakers";

/**
 * Public filmmaker profile. Resolves the filmmaker after approvals: only APPROVED revisions
 * change what's shown here, and profiles created by approved applications appear too.
 */
export function FilmmakerProfileView({
  slug,
  seed,
  seedApplications,
  articles,
}: {
  slug: string;
  seed: Filmmaker[];
  seedApplications: FilmmakerApplication[];
  articles: JournalArticle[];
}) {
  const { published } = useFilmmakers(seed, seedApplications);
  const f = published.find((x) => x.slug === slug);
  if (!f) {
    return (
      <PageContainer width="narrow" className="py-24">
        <EmptyState
          title="Filmmaker not found"
          description="This profile doesn't exist or isn't published. Browse the directory to find filmmakers."
          action={{ label: "Open the directory", href: "/filmmakers" }}
        />
      </PageContainer>
    );
  }
  const mine = articles.filter((a) => a.filmmakerSlugs?.includes(f.slug));
  return <Profile f={f} articles={mine} />;
}

function Profile({ f, articles }: { f: Filmmaker; articles: JournalArticle[] }) {
  const credits = [...f.credits].sort((a, b) => b.year - a.year);
  const paragraphs = f.biography.split("\n\n");

  return (
    <article>
      <PageContainer width="wide" className="pt-8">
        <Link
          href="/filmmakers"
          className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
        >
          ← All filmmakers
        </Link>
      </PageContainer>

      <PageContainer as="header" width="wide" className="grid gap-10 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-end lg:gap-16 lg:py-14">
        <FilmmakerPortrait
          filmmaker={f}
          aspect="aspect-[4/5]"
          priority
          sizes="(min-width: 768px) 40vw, 100vw"
          className="max-h-[42rem] w-full"
        />
        <div>
          <Eyebrow>{f.primaryDiscipline}</Eyebrow>
          <h1 className="type-display-xl mt-4 !text-[clamp(2.5rem,6vw,5rem)]">{f.name}</h1>
          {f.tagline && <p className="mt-5 text-xl text-reading/70">{f.tagline}</p>}
          <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-border py-6 sm:grid-cols-3">
            <div>
              <dt className="type-eyebrow text-muted-foreground">Based in</dt>
              <dd className="mt-1 font-medium">
                {f.location ? `${f.location}, ` : ""}
                {f.country}
              </dd>
            </div>
            {f.yearsActive && (
              <div>
                <dt className="type-eyebrow text-muted-foreground">Years active</dt>
                <dd className="mt-1 font-medium">{f.yearsActive}</dd>
              </div>
            )}
            <div>
              <dt className="type-eyebrow text-muted-foreground">Credits</dt>
              <dd className="mt-1 font-medium">{f.credits.length}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <FollowButton target={followId.filmmaker(f.slug)} name={f.name} />
            {f.links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-1.5 border border-white/25 px-4 text-xs font-bold uppercase tracking-[0.08em] transition-colors hover:border-white hover:bg-white/5"
              >
                {l.label} <ArrowUpRight className="size-3.5" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>
      </PageContainer>

      <section aria-labelledby="bio-heading" className="border-t border-border">
        <PageContainer width="wide" className="grid gap-8 py-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="bio-heading" className="type-display-md">
            Biography
          </h2>
          <div className="max-w-2xl space-y-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-lg leading-[1.8] text-reading">
                {p}
              </p>
            ))}
          </div>
        </PageContainer>
      </section>

      {f.creativePhilosophy && (
        <section aria-label="Creative philosophy" className="border-t border-border bg-[#141414]">
          <PageContainer width="wide" className="py-16 sm:py-24">
            <Eyebrow>Creative philosophy</Eyebrow>
            <blockquote className="mt-5 max-w-4xl border-l-4 border-gold pl-6 sm:pl-10">
              <p className="font-display text-3xl font-black leading-tight text-balance sm:text-5xl">
                “{f.creativePhilosophy}”
              </p>
              <footer className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {f.name}
              </footer>
            </blockquote>
          </PageContainer>
        </section>
      )}

      <section aria-label="Professional credits" className="border-t border-border">
        <PageContainer width="wide" className="py-14">
          <SectionHeader as="h2" eyebrow="Filmography" title="Professional credits" />
          <ol>
            {credits.map((c) => (
              <li
                key={c.id}
                className="grid gap-x-8 gap-y-1 border-t border-border py-5 sm:grid-cols-[5rem_minmax(0,1fr)_14rem]"
              >
                <span className="font-display text-xl font-black text-gold">{c.year}</span>
                <div>
                  <p className="font-display text-xl font-black">
                    {c.title}{" "}
                    {c.inProduction && (
                      <Badge variant="gold" className="ml-2 align-middle">
                        In production
                      </Badge>
                    )}
                  </p>
                  {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
                </div>
                <div className="text-sm text-muted-foreground sm:text-right">
                  <p className="font-medium text-foreground/90">{c.role}</p>
                  <p>
                    {c.format}
                    {c.runtimeMinutes ? ` · ${c.runtimeMinutes} min` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-xs text-muted-foreground">
            Credits describe professional work and are not available to watch on DORIS TV.
          </p>
        </PageContainer>
      </section>

      {articles.length > 0 && (
        <section aria-label="From the Journal" className="border-t border-border bg-[#141414]">
          <PageContainer width="wide" className="py-16">
            <SectionHeader as="h2" eyebrow="From the Journal" title={`${f.name} in the Journal`} />
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} variant={a.category === "Video" ? "video" : "standard"} />
              ))}
            </div>
          </PageContainer>
        </section>
      )}
    </article>
  );
}
