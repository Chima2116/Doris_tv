"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/page-container";
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
      {/* Split screen: portrait slot beside a dark identity panel */}
      <header className="grid lg:min-h-[40rem] lg:grid-cols-2">
        <FilmmakerPortrait filmmaker={f} aspect="aspect-[4/5] lg:aspect-auto lg:h-full" priority sizes="(min-width: 1024px) 50vw, 100vw" className="w-full" />
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
          <Link href="/filmmakers" className="tag mb-8 w-fit text-white/60 hover:text-white">← All filmmakers</Link>
          <p className="tag inline-block border border-gold/50 px-2 py-1 text-gold">{f.primaryDiscipline}</p>
          <h1 className="display-name mt-4 text-[clamp(2.5rem,5.5vw,4.5rem)]">{f.name}</h1>
          {f.tagline && <p className="mt-5 max-w-[32rem] text-xl leading-snug text-white/80">{f.tagline}</p>}
          <dl className="mt-8 grid max-w-[34rem] grid-cols-2 gap-6 border-t border-white/20 pt-6 sm:grid-cols-3">
            <div>
              <dt className="tag text-white/55">Based in</dt>
              <dd className="mt-1 text-[0.9375rem] font-medium">{f.location ? `${f.location}, ` : ""}{f.country}</dd>
            </div>
            {f.yearsActive && (
              <div>
                <dt className="tag text-white/55">Years active</dt>
                <dd className="mt-1 text-[0.9375rem] font-medium">{f.yearsActive}</dd>
              </div>
            )}
            <div>
              <dt className="tag text-white/55">Credits</dt>
              <dd className="mt-1 text-[0.9375rem] font-medium">{f.credits.length}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <FollowButton target={followId.filmmaker(f.slug)} name={f.name} />
            {f.links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-1.5 border border-white/30 px-4 text-sm font-semibold transition-colors hover:bg-white hover:text-black"
              >
                {l.label} <ArrowUpRight className="size-3.5" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      {f.creativePhilosophy && (
        <section aria-label="Creative philosophy" className="bg-[#1c1c1c]">
          <PageContainer width="wide" className="py-16 sm:py-24">
            <p className="tag text-gold">Creative philosophy</p>
            <blockquote className="mt-6 max-w-4xl">
              <p className="text-[clamp(1.5rem,3.6vw,2.75rem)] font-bold leading-[1.15] tracking-tight text-balance">“{f.creativePhilosophy}”</p>
              <footer className="tag mt-6 text-white/60">{f.name}</footer>
            </blockquote>
          </PageContainer>
        </section>
      )}

      <section aria-labelledby="bio-heading">
        <PageContainer width="wide" className="grid gap-8 py-16 md:grid-cols-12">
          <h2 id="bio-heading" className="heading-section md:col-span-4">Biography</h2>
          <div className="max-w-2xl space-y-5 md:col-span-7 md:col-start-6">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[1.0625rem] leading-[1.8] text-reading">{p}</p>
            ))}
          </div>
        </PageContainer>
      </section>

      <section aria-label="Professional credits" className="bg-[#141414]">
        <PageContainer width="wide" className="py-16">
          <div className="mb-8">
            <p className="tag text-gold">Filmography</p>
            <h2 className="heading-section mt-3">Professional credits</h2>
          </div>
          <ol>
            {credits.map((c, i) => (
              <li key={c.id} className="grid gap-x-8 gap-y-1 border-t border-white/20 py-5 sm:grid-cols-[3rem_5rem_minmax(0,1fr)_14rem]">
                <span className="meta hidden tabular-nums text-white/50 sm:block">[{i + 1}]</span>
                <span className="text-xl font-bold tabular-nums">{c.year}</span>
                <div>
                  <p className="heading-card text-xl">
                    {c.title}
                    {c.inProduction && <span className="tag ml-3 inline-flex items-center gap-1.5 align-middle text-white/80"><span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />In production</span>}
                  </p>
                  {c.description && <p className="mt-1 text-sm text-white/60">{c.description}</p>}
                </div>
                <div className="text-sm text-white/60 sm:text-right">
                  <p className="font-medium text-white/90">{c.role}</p>
                  <p>{c.format}{c.runtimeMinutes ? ` · ${c.runtimeMinutes} min` : ""}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-xs text-white/50">Credits describe professional work and are not available to watch on DORIS TV.</p>
        </PageContainer>
      </section>

      {articles.length > 0 && (
        <section aria-label="From the Journal">
          <PageContainer width="wide" className="py-16">
            <div className="mb-8">
              <p className="tag text-gold">From the Journal</p>
              <h2 className="heading-section mt-3">{f.name} in the Journal</h2>
            </div>
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
