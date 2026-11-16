import Link from "next/link";
import type { HomeCopy } from "@/data/copy/site-copy";
import { ArrowRight, ArrowUpRight, Heart, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselItem } from "@/components/shared/carousel";
import { ImageSettle, Stagger } from "@/components/shared/motion";
import { Reveal } from "@/components/shared/reveal";
import { Photo } from "@/components/shared/photo";
import { IMAGES } from "@/data/images";
import { getMemberById } from "@/data/repositories/discussions";
import type { Discussion, Filmmaker, JournalArticle, Member } from "@/data/types";
import type { CollectionInfo } from "@/features/journal/categories";
import { articleImage } from "@/features/journal/article-image";
import { StoryCover } from "@/features/journal/story-cover";
import { initials } from "@/lib/utils";
import { readingLabel, timeAgo } from "@/lib/format";

const wrap = "mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12";
const link = "hover:underline hover:decoration-white/40 hover:underline-offset-[6px]";

/* ─────────────────────────── 1. CINEMATIC HERO ─────────────────────────── */
/** One photograph dominates; headline, copy and actions sit on it. The Journal rail overlaps its lower edge. */
export function Hero({ copy }: { copy: HomeCopy }) {
  const img = IMAGES.homeHero;
  return (
    <section aria-label="Welcome" className="relative isolate flex min-h-[max(34rem,calc(100svh-10rem))] items-end overflow-hidden pb-32 sm:pb-36 lg:pb-44">
      <ImageSettle className="absolute inset-0 -z-20">
        <Photo asset={img} fill priority sizes="100vw" />
      </ImageSettle>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/30" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[85%] bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
      <div aria-hidden="true" className="absolute inset-y-0 left-0 -z-10 hidden w-[55%] bg-gradient-to-r from-black/45 to-transparent lg:block" />

      <Stagger className={`${wrap} pt-32`}>
        <p className="tag mb-5 text-gold">{copy.heroEyebrow}</p>
        <h1 className="display-hero max-w-[15ch] sm:max-w-[16ch]">{copy.heroHeadline}<span className="text-gold">.</span></h1>
        <p className="mt-6 max-w-[38rem] text-[1.0625rem] leading-relaxed text-white/85 sm:text-lg">{copy.heroIntro}</p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link href="/journal">Explore the Journal</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/filmmakers">Discover filmmakers</Link>
          </Button>
        </div>
      </Stagger>
    </section>
  );
}

/* ─────────────────────────── 2. JOURNAL RAIL (overlaps the hero) ─────────────────────────── */
export function JournalRail({ stories }: { stories: JournalArticle[] }) {
  return (
    <section aria-label="Latest from the Journal" className="relative z-10 -mt-20 sm:-mt-28 lg:-mt-36">
      <div className={wrap}>
        <div className="mb-3 flex items-end justify-between gap-6">
          <h2 className="heading-card text-xl text-white">Latest from the Journal</h2>
          <Link href="/journal" className="hidden items-center gap-2 text-sm font-semibold text-white/80 hover:text-white sm:inline-flex">
            All stories <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <Carousel label="Latest stories" trackClassName="-mx-5 px-5 scroll-pl-5 sm:-mx-8 sm:px-8 sm:scroll-pl-8 lg:-mx-12 lg:px-12 lg:scroll-pl-12">
          {stories.map((s, i) => (
            <CarouselItem key={s.slug} className="w-[68vw] sm:w-[17rem] lg:w-[18.5rem]">
              <Link href={`/journal/${s.slug}`} className="group block">
                {articleImage(s) ? (
                  <div className="relative">
                    <Photo asset={articleImage(s)} ratio="3/4" sizes="(min-width: 1024px) 18.5rem, 68vw" imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/60 to-transparent" />
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/4bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-between p-5">
                      <p className="tag">{s.category}</p>
                      <h3 className="heading-card text-[1.1875rem] leading-snug">{s.title}</h3>
                    </div>
                  </div>
                ) : (
                  <StoryCover category={s.category} className="aspect-[3/4]">
                    <h3 className="heading-card text-[1.1875rem] leading-snug">{s.title}</h3>
                  </StoryCover>
                )}
                <p className="meta mt-3 text-white/55">
                  <span className="tabular-nums text-gold">[{i + 1}]</span> {s.author} · {readingLabel(s)}
                </p>
              </Link>
            </CarouselItem>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

/* ─────────────────────────── 3. FEATURED EDITORIAL ─────────────────────────── */
/** One large story and three smaller ones, in clearly different proportions. */
export function FeaturedEditorial({ story, supporting }: { story: JournalArticle; supporting: JournalArticle[] }) {
  const img = IMAGES.fespacoEntrance;
  return (
    <section aria-label="Featured story" className={`${wrap} py-20 sm:py-28`}>
      <Reveal>
        <p className="tag mb-6 text-white/60">Featured</p>
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <div className="group relative">
              <Photo asset={img} ratio="16/10" sizes="(min-width: 1024px) 66vw, 100vw" imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
              <Link href={`/journal/${story.slug}`} aria-label={story.title} className="absolute inset-0" />
            </div>
            <p className="tag mt-8 text-gold">{story.category}</p>
            <h2 className="heading-feature mt-3 max-w-[24ch] text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.1]">
              <Link href={`/journal/${story.slug}`} className={link}>{story.title}</Link>
            </h2>
            {story.deck && <p className="mt-4 max-w-[38rem] text-base leading-relaxed text-white/70">{story.deck}</p>}
            <p className="meta mt-5 text-white/55">{story.author} · {readingLabel(story)}</p>
          </article>

          <ol className="flex flex-col border-l border-gold/40 pl-6 lg:col-span-4">
            {supporting.map((s, i) => (
              <li key={s.slug} className="group border-t border-white/15 py-6 first:border-t-0 first:pt-0">
                <Link href={`/journal/${s.slug}`} className="grid grid-cols-[2.25rem_1fr] gap-x-3">
                  <span className="meta tabular-nums text-gold">[{i + 1}]</span>
                  <span>
                    <span className="tag block text-gold">{s.category}</span>
                    <span className="heading-card mt-2 block text-[1.1875rem] leading-snug group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">{s.title}</span>
                    <span className="meta mt-3 flex items-center gap-2 text-white/55">
                      {s.author} · {readingLabel(s)}
                      <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}

/* ─────────────────────────── 4. COLLECTIONS ─────────────────────────── */

export function Collections({ articles, collections }: { articles: JournalArticle[]; collections: CollectionInfo[] }) {
  return (
    <section aria-label="Journal collections" className="bg-[#141414] py-20 sm:py-28">
      <div className={wrap}>
        <Reveal className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="heading-section lg:col-span-6">Browse the Journal by collection.</h2>
          <p className="text-base leading-relaxed text-white/65 lg:col-span-5 lg:col-start-8">
            Five ways in: conversations with filmmakers, essays on form, notes from set, retrospectives and video conversations.
          </p>
        </Reveal>
        <Carousel label="Journal collections" trackClassName="-mx-5 px-5 scroll-pl-5 sm:-mx-8 sm:px-8 sm:scroll-pl-8 lg:-mx-12 lg:px-12 lg:scroll-pl-12">
          {collections.map((c, i) => {
            const items = articles.filter((a) => a.category === c.name);
            const img = c.image;
            return (
              <CarouselItem key={c.value} className="w-[80vw] sm:w-[22rem] lg:w-[24rem]">
                <Link href={`/journal?category=${c.value}`} className="group relative isolate flex aspect-[4/5] flex-col justify-between overflow-hidden p-7 sm:p-8">
                  <Photo asset={img} fill sizes="(min-width: 1024px) 24rem, 80vw" className="-z-20" imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-1/4 bg-gradient-to-b from-black/60 to-transparent" />
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[70%] bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                  <span className="meta tabular-nums text-gold">[{i + 1}]</span>
                  <span>
                    <span className="heading-section block text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.05]">{c.label}</span>
                    <span className="mt-3 block text-sm leading-relaxed text-white/80">{c.description}</span>
                    <span className="meta mt-5 flex items-center justify-between border-t border-white/30 pt-4 text-white/85">
                      {items.length} {items.length === 1 ? "story" : "stories"}
                      <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </CarouselItem>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}

/* ─────────────────────────── 5. FILMMAKER SPOTLIGHT (split screen) ─────────────────────────── */
export function FilmmakerSpotlight({ filmmaker }: { filmmaker: Filmmaker }) {
  const bio = filmmaker.biography.split("\n\n")[0];
  const recent = [...filmmaker.credits].sort((a, b) => b.year - a.year).slice(0, 3);
  return (
    <section aria-label="Filmmaker spotlight" className="grid lg:min-h-[44rem] lg:grid-cols-2">
      <div className="group relative min-h-[26rem] overflow-hidden">
        <Photo asset={IMAGES.spotlightDoc} fill sizes="(min-width: 1024px) 50vw, 100vw" imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        <Link href={`/filmmakers/${filmmaker.slug}`} aria-label={`${filmmaker.name}, profile`} className="absolute inset-0" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
        <p className="pointer-events-none absolute bottom-3 left-5 right-5 max-w-[34rem] text-[0.6875rem] leading-snug text-white/80">
          Illustrative photograph, not a portrait of {filmmaker.name} (portrait to be supplied).
        </p>
      </div>
      <div className="flex flex-col justify-center bg-[#0d0d0d] px-6 py-16 sm:px-12 lg:px-16 xl:px-24">
        <Reveal>
          <p className="tag text-gold">Filmmaker spotlight</p>
          <h2 className="display-name mt-4">
            <Link href={`/filmmakers/${filmmaker.slug}`} className={link}>{filmmaker.name}</Link>
          </h2>
          <p className="mt-4 text-base font-medium text-white/80">{filmmaker.primaryDiscipline} · {filmmaker.location}, {filmmaker.country}</p>
          {filmmaker.creativePhilosophy && <blockquote className="mt-8 max-w-[32rem] text-xl font-medium leading-snug">“{filmmaker.creativePhilosophy}”</blockquote>}
          <p className="mt-5 max-w-[34rem] text-[0.9375rem] leading-[1.75] text-white/65">{bio}</p>
          <ul className="mt-8 max-w-[30rem] space-y-2 text-sm">
            {recent.map((c) => (
              <li key={c.id} className="flex justify-between gap-6 border-t border-white/15 pt-2 text-white/80"><span className="font-medium">{c.title}</span><span className="text-white/50">{c.year}</span></li>
            ))}
          </ul>
          <Button asChild className="mt-4">
            <Link href={`/filmmakers/${filmmaker.slug}`}>Read the profile <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────── 6. COMMUNITY ─────────────────────────── */
function Person({ member, className }: { member: Member | null; className?: string }) {
  return (
    <Avatar className={className ?? "size-8"}>
      <AvatarFallback className="bg-white/15 text-[0.65rem] font-semibold text-white">{initials(member?.displayName ?? "M")}</AvatarFallback>
    </Avatar>
  );
}

async function RecentConversation({ d }: { d: Discussion }) {
  const author = await getMemberById(d.authorId);
  return (
    <li>
      <Link href={`/community/${d.id}`} className="group flex h-full flex-col gap-5 border-t border-white/20 pt-6">
        <p className="tag text-gold">{d.category}</p>
        <h3 className="heading-card text-[1.25rem] leading-snug group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">{d.title}</h3>
        <p className="meta mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-white/55">
          <Person member={author} className="size-6" />
          <span className="text-white/80">{author?.displayName ?? "A member"}</span>
          <span>{timeAgo(d.createdAt)}</span>
          <span className="inline-flex items-center gap-1 tabular-nums"><MessageSquare className="size-3.5" aria-hidden="true" />{d.replyCount}<span className="sr-only"> replies</span></span>
          <ArrowRight className="ml-auto size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
        </p>
      </Link>
    </li>
  );
}

export async function Community({ featured, recent, topics, memberIds }: { featured: Discussion; recent: Discussion[]; topics: { name: string; count: number }[]; memberIds: string[] }) {
  const img = IMAGES.crewNairobi;
  const [author, ...people] = await Promise.all([getMemberById(featured.authorId), ...memberIds.slice(0, 5).map((id) => getMemberById(id))]);
  return (
    <section aria-label="Community" className="bg-[#0d0d0d] py-20 sm:py-28">
      <div className={wrap}>
        <Reveal className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="tag text-gold">Community</p>
            <h2 className="display-name mt-4 max-w-[20ch] text-[clamp(2.25rem,5vw,4rem)]">The conversation around African cinema.</h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-base leading-relaxed text-white/65">Filmmakers, writers and film lovers on craft, funding, festivals and what to watch. Anyone can read. Members take part.</p>
            <div className="mt-5 flex items-center gap-3" aria-label="Members in recent conversations">
              <div className="flex -space-x-2">{people.map((m, i) => <Person key={i} member={m} className="size-8 ring-2 ring-[#0d0d0d]" />)}</div>
              <span className="meta text-white/60">{memberIds.length} members talking this week</span>
            </div>
          </div>
        </Reveal>

        {/* Featured discussion: image beside a dark panel */}
        <Reveal>
          <article className="grid overflow-hidden lg:grid-cols-12">
            <div className="group relative min-h-[20rem] lg:col-span-7 lg:min-h-[32rem]">
              <Photo asset={img} fill sizes="(min-width: 1024px) 58vw, 100vw" imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
              <Link href={`/community/${featured.id}`} aria-label={featured.title} className="absolute inset-0" />
            </div>
            <div className="flex flex-col justify-center bg-[#1c1c1c] p-7 sm:p-10 lg:col-span-5 lg:p-12">
              <p className="tag text-gold">Featured discussion · {featured.category}</p>
              <h3 className="heading-feature mt-4">
                <Link href={`/community/${featured.id}`} className={link}>{featured.title}</Link>
              </h3>
              <p className="mt-4 line-clamp-4 text-[0.9375rem] leading-relaxed text-white/70">{featured.body}</p>
              <p className="meta mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/60">
                <Person member={author} />
                <span className="text-white/85">{author?.displayName ?? "A member"}</span>
                <span>{timeAgo(featured.createdAt)}</span>
                <span className="inline-flex items-center gap-1 tabular-nums"><MessageSquare className="size-3.5" aria-hidden="true" />{featured.replyCount}<span className="sr-only"> replies</span></span>
                <span className="inline-flex items-center gap-1 tabular-nums"><Heart className="size-3.5" aria-hidden="true" />{featured.reactionCount}<span className="sr-only"> reactions</span></span>
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Button asChild variant="gold">
                  <Link href={`/community/${featured.id}`}>Join the discussion</Link>
                </Button>
                <p className="text-sm text-white/60">Reading is open. <Link href="/sign-up" className="font-semibold text-white underline underline-offset-4">Create a free account</Link> to reply.</p>
              </div>
            </div>
          </article>
        </Reveal>

        {/* Recent conversations: room to breathe */}
        <Reveal className="mt-16">
          <div className="mb-8 flex items-end justify-between gap-6">
            <h3 className="heading-card text-xl">Recent conversations</h3>
            <Link href="/community" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors duration-200 hover:text-gold">
              All discussions <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((d) => <RecentConversation key={d.id} d={d} />)}
          </ul>
        </Reveal>

        {/* Topics: large type, not chips */}
        <Reveal className="mt-20">
          <p className="tag mb-5 text-gold">Topics</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 sm:gap-x-12">
            {topics.map((t) => (
              <li key={t.name}>
                <Link href={`/community?category=${encodeURIComponent(t.name)}`} className="group inline-flex items-baseline gap-2 text-[clamp(1.5rem,3.4vw,2.5rem)] font-bold leading-tight tracking-tight text-white/85 transition-colors hover:text-white">
                  <span className="underline decoration-transparent decoration-2 underline-offset-[8px] transition-colors group-hover:decoration-white/60">{t.name}</span>
                  <span className="meta tabular-nums text-white/45">{t.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────── 7. MEMBERSHIP ─────────────────────────── */
const BENEFITS = [
  ["Follow filmmakers", "Keep up with the people whose work you want to see more of."],
  ["Save stories", "Build a reading list from the Journal and return to it."],
  ["Join the conversation", "Reply, react and start discussions with other members."],
];

export function Invitation({ copy }: { copy: HomeCopy }) {
  return (
    <section aria-label="Create a free account" className="bg-[#1c1c1c]">
      <div className={`${wrap} py-20 sm:py-28`}>
        <Reveal>
          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-end">
            <h2 className="display-name text-[clamp(2.25rem,5vw,4rem)] lg:col-span-7">{copy.invitationHeadline}</h2>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="text-base leading-relaxed text-white/70">{copy.invitationText}</p>
              <Button asChild variant="gold" size="lg" className="mt-6">
                <Link href="/sign-up">Create a free account</Link>
              </Button>
            </div>
          </div>
          <ol className="mt-14 grid gap-8 border-t border-white/20 pt-8 sm:grid-cols-3">
            {BENEFITS.map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[2.25rem_1fr]">
                <span className="meta tabular-nums text-gold">[{i + 1}]</span>
                <span>
                  <span className="heading-card block text-lg">{t}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-white/65">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
