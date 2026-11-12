import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArtImage } from "@/components/shared/art-image";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Filmstrip } from "@/components/shared/filmstrip";
import { PageContainer } from "@/components/shared/page-container";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeader } from "@/components/shared/section-header";
import { getArticles } from "@/data/repositories/articles";
import { getDiscussions } from "@/data/repositories/discussions";
import { getFilmmakers, getSpotlightFilmmaker } from "@/data/repositories/filmmakers";
import { DiscussionPreview } from "@/features/community/discussion-preview";
import { FilmmakerPortrait } from "@/features/filmmakers/filmmaker-card";
import { ArticleCard, ArticleMeta } from "@/features/journal/article-card";

export default async function HomePage() {
  const [articles, spotlight, discussions, filmmakers] = await Promise.all([
    getArticles(),
    getSpotlightFilmmaker(),
    getDiscussions(),
    getFilmmakers(),
  ]);
  const written = articles.filter((a) => a.category !== "Video");
  const featured = written.find((a) => a.featured) ?? written[0];
  const rest = written.filter((a) => a.slug !== featured.slug);
  const strip = rest.slice(0, 2);
  const latest = rest.slice(2, 6);
  const spotlightBio = spotlight?.biography.split("\n\n")[0];

  return (
    <>
      {/* HERO: cinematic, image-led, with the featured story pinned underneath */}
      <section className="relative isolate overflow-hidden">
        <ArtImage
          alt="Warm amber light falling across a darkened cinema interior"
          seed="home-hero"
          ghost="DORIS"
          aspect="absolute inset-0 h-full w-full"
          className="-z-10"
          priority
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <PageContainer width="wide" className="flex min-h-[min(46rem,calc(100dvh-4rem))] flex-col justify-end pb-12 pt-32">
          <Reveal>
            <Eyebrow className="mb-5">Independent African cinema</Eyebrow>
            <h1 className="type-display-xl max-w-4xl">Where Independent African Film Lives.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-reading/70">
              Interviews, essays and production notes from the people making African cinema, a
              directory of filmmakers, and a community that takes the work seriously.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/journal">Explore the Journal</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/waitlist">Join the waitlist</Link>
              </Button>
            </div>
          </Reveal>

          <div className="mt-16 border-t border-white/10 pt-6">
            <p className="type-eyebrow mb-4 text-muted-foreground">From the Journal</p>
            <div className="grid gap-px bg-white/10 lg:grid-cols-[1.6fr_1fr_1fr]">
              {[featured, ...strip].map((a, i) => (
                <Link
                  key={a.id}
                  href={`/journal/${a.slug}`}
                  className="group bg-background/90 p-6 transition-colors hover:bg-surface"
                >
                  <Eyebrow className="mb-3">{i === 0 ? `Cover story · ${a.category}` : a.category}</Eyebrow>
                  <span
                    className={`block font-display font-black leading-snug group-hover:text-gold ${i === 0 ? "text-xl md:text-2xl" : "text-lg"}`}
                  >
                    {a.title}
                  </span>
                  {i === 0 && a.deck && <span className="mt-3 line-clamp-2 block text-sm text-reading/55">{a.deck}</span>}
                  <ArticleMeta article={a} className="mt-4" />
                </Link>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* LATEST JOURNAL */}
      <section className="border-t border-border py-20" aria-label="Latest from the Journal">
        <PageContainer width="wide">
          <SectionHeader
            as="h2"
            eyebrow="The Journal"
            title="Latest from the Journal"
            action={{ label: "View all", href: "/journal" }}
          />
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-7">
              <ArticleCard article={latest[0]} variant="lead" />
            </Reveal>
            <div className="lg:col-span-5">
              {latest.slice(1).map((a, i) => (
                <ArticleCard key={a.id} article={a} variant="compact" index={i + 1} />
              ))}
              <div className="border-t border-border pt-6">
                <Link href="/journal" className="text-xs font-bold uppercase tracking-[0.08em] text-gold hover:underline">
                  Browse every story →
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* FILMMAKER SPOTLIGHT */}
      {spotlight && (
        <section className="border-t border-border bg-[#141414]" aria-label="Filmmaker spotlight">
          <PageContainer width="wide" className="grid items-stretch gap-0 lg:grid-cols-2">
            <Link href={`/filmmakers/${spotlight.slug}`} className="group relative block overflow-hidden">
              <FilmmakerPortrait
                filmmaker={spotlight}
                aspect="aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[34rem]"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <span className="absolute left-5 top-5 bg-gold px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-primary-foreground">
                Filmmaker spotlight
              </span>
            </Link>
            <div className="flex flex-col justify-center py-12 lg:px-16 lg:py-20">
              <Eyebrow>
                {spotlight.primaryDiscipline} · {spotlight.location ?? spotlight.country}
              </Eyebrow>
              <h2 className="type-display-lg mt-4 !text-[clamp(2rem,4vw,3.25rem)]">{spotlight.name}</h2>
              <p className="mt-4 text-xl text-reading/80">{spotlight.tagline}</p>
              <p className="mt-6 max-w-lg leading-relaxed text-reading/60">{spotlightBio}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/filmmakers/${spotlight.slug}`}>Read the profile</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/filmmakers">All filmmakers</Link>
                </Button>
              </div>
            </div>
          </PageContainer>
        </section>
      )}

      {/* COMMUNITY PREVIEW */}
      <section className="border-t border-border py-20" aria-label="Community">
        <PageContainer width="wide" className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Community</Eyebrow>
            <h2 className="type-display-md mt-3">Conversation, by people who care about the work.</h2>
            <p className="mt-5 max-w-md text-reading/60">
              Read the discussions, then join in. Members start threads, share recommendations and
              talk craft, distribution and festivals.
            </p>
            <dl className="mt-8 flex gap-10">
              {[
                [discussions.length, "Discussions"],
                [filmmakers.length, "Filmmakers"],
                [articles.length, "Stories"],
              ].map(([n, label]) => (
                <div key={label}>
                  <dd className="font-display text-4xl font-black text-gold">{n}</dd>
                  <dt className="type-eyebrow text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
            <Button asChild className="mt-9">
              <Link href="/community">Enter the community</Link>
            </Button>
          </div>
          <div className="lg:col-span-7">
            <ol className="border-b border-border">
              {discussions.slice(0, 4).map((d) => (
                <DiscussionPreview key={d.id} discussion={d} />
              ))}
            </ol>
          </div>
        </PageContainer>
      </section>

      {/* MEMBERSHIP CTA */}
      <section className="border-t border-border" aria-label="Join the waitlist">
        <Filmstrip />
        <PageContainer width="narrow" className="py-24 text-center">
          <Eyebrow>Join DORIS TV</Eyebrow>
          <h2 className="type-display-lg mt-4">Independent African film deserves a real home.</h2>
          <p className="mx-auto mt-5 max-w-lg text-reading/60">
            Be among the first members. Join the waitlist to follow filmmakers, save stories and
            take part in the conversation.
          </p>
          <Button asChild size="lg" className="mt-9">
            <Link href="/waitlist">Join the waitlist</Link>
          </Button>
        </PageContainer>
      </section>
    </>
  );
}
