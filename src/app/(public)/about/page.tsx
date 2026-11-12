import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Photo, PhotoCredit } from "@/components/shared/photo";
import { IMAGES } from "@/data/images";
import { PageContainer } from "@/components/shared/page-container";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "DORIS TV is an editorial and community home for independent African cinema: the Journal, filmmaker profiles and a community built around the work.",
};

const PILLARS = [
  {
    n: "01",
    title: "The Journal",
    body: "Interviews, essays, production notes, retrospectives and video conversations, written and commissioned with the seriousness African cinema deserves.",
    href: "/journal",
    cta: "Read the Journal",
  },
  {
    n: "02",
    title: "The Filmmakers",
    body: "A directory of independent filmmakers with professional profiles: who they are, how they think, and the work they have made.",
    href: "/filmmakers",
    cta: "Meet the filmmakers",
  },
  {
    n: "03",
    title: "The Community",
    body: "A place to talk about the work: craft, festivals, distribution and recommendations, among people who care to look closely.",
    href: "/community",
    cta: "Join the conversation",
  },
];

export default function AboutPage() {
  // The same photograph as the home hero, cropped to the market scene on the right.
  const img = { ...IMAGES.homeHero, focal: "82% 55%" };
  return (
    <>
      <section aria-label="About DORIS TV" className="grid lg:min-h-[36rem] lg:grid-cols-12">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:col-span-7 lg:px-16 xl:px-24">
          <p className="tag text-white/60">About DORIS TV</p>
          <h1 className="display-name mt-5 max-w-[18ch] text-[clamp(2.25rem,5.5vw,4.75rem)]">African cinema deserves attention, context and company.</h1>
        </div>
        <div className="relative min-h-[18rem] lg:col-span-5">
          <Photo asset={img} fill priority sizes="(min-width: 1024px) 42vw, 100vw" />
          <PhotoCredit asset={img} withCaption={false} className="absolute bottom-3 left-4 right-4 text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,.7)]" />
        </div>
      </section>

      <section aria-label="Manifesto" className="bg-[#1c1c1c]">
        <PageContainer width="narrow" className="py-20 sm:py-28">
          <Reveal>
            <p className="text-[clamp(1.5rem,3.4vw,2.5rem)] font-bold leading-[1.2] tracking-tight text-balance">
              Independent African film is being made with extraordinary ambition, often with very little. Too much of it is hard to find, hard to read about, and hard to talk about.
            </p>
          </Reveal>
          <Reveal delay={0.05} className="mt-10 space-y-6 text-lg leading-[1.85] text-reading">
            <p>
              DORIS TV exists to change that. We are building an editorial and community home for independent African cinema: a place where filmmakers are represented professionally, where their work is written about with care, and where people who love film can meet each other.
            </p>
            <p>
              We believe the conversation around a film is part of the film&apos;s life. Good criticism, honest production writing and generous discussion are how a cinema builds a memory, and how the next generation of filmmakers finds the ones who came before.
            </p>
          </Reveal>
        </PageContainer>
      </section>

      <section aria-label="What we are building and why">
        <PageContainer width="wide" className="grid gap-12 py-20 md:grid-cols-2 md:gap-20">
          <Reveal>
            <p className="tag text-white/60">[1] What we&apos;re building</p>
            <h2 className="heading-section mt-3">A curated cultural destination.</h2>
            <p className="mt-5 leading-relaxed text-white/70">
              Not a generic social network, and not a catalogue. A carefully edited site where stories, people and conversation sit side by side, and where quality comes before volume.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="tag text-white/60">[2] Why it matters</p>
            <h2 className="heading-section mt-3">Visibility changes what gets made.</h2>
            <p className="mt-5 leading-relaxed text-white/70">
              When filmmakers are discoverable and their work is taken seriously, they find collaborators, audiences and the confidence to keep going. Independent film depends on that ecosystem as much as on cameras and budgets.
            </p>
          </Reveal>
        </PageContainer>
      </section>

      <section aria-label="How DORIS TV works" className="bg-[#141414]">
        <PageContainer width="wide" className="py-20">
          <ol className="grid gap-10 md:grid-cols-3">
            {PILLARS.map((p) => (
              <li key={p.n} className="group flex flex-col border-t border-white/25 pt-6">
                <span className="meta tabular-nums text-white/60">[{Number(p.n)}]</span>
                <h2 className="heading-feature mt-4 text-2xl">{p.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/65">{p.body}</p>
                <Link href={p.href} className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold underline decoration-white/40 underline-offset-[6px] hover:decoration-white">
                  {p.cta} <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </PageContainer>
      </section>

      <section aria-label="Get involved" className="bg-[#1c1c1c]">
        <PageContainer width="narrow" className="py-20 sm:py-28">
          <p className="tag text-white/60">Get involved</p>
          <h2 className="display-name mt-4 text-[clamp(2rem,4.5vw,3.5rem)]">Be part of it from the start.</h2>
          <p className="mt-5 max-w-lg text-white/70">
            Anyone can join the waitlist. Filmmakers can then apply for a profile, reviewed by our team.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="gold">
              <Link href="/waitlist">Join the waitlist</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/filmmaker-application">Apply as a filmmaker</Link>
            </Button>
          </div>
          <p className="mt-12 text-xs text-white/50">DORIS TV is published by Doris Entertainment Networks Limited.</p>
        </PageContainer>
      </section>
    </>
  );
}
