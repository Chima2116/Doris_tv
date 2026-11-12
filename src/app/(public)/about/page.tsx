import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Filmstrip } from "@/components/shared/filmstrip";
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
  return (
    <>
      <section className="border-b border-border">
        <PageContainer width="wide" className="py-20 sm:py-32">
          <Eyebrow>About DORIS TV</Eyebrow>
          <h1 className="type-display-xl mt-6 max-w-5xl">
            African cinema deserves attention, context and company.
          </h1>
        </PageContainer>
      </section>

      <section aria-label="Manifesto">
        <PageContainer width="narrow" className="py-20 sm:py-28">
          <Reveal>
            <p className="font-display text-2xl font-black leading-snug text-balance sm:text-4xl">
              Independent African film is being made with extraordinary ambition, often with very
              little. Too much of it is hard to find, hard to read about, and hard to talk about.
            </p>
          </Reveal>
          <Reveal delay={0.05} className="mt-10 space-y-6 text-lg leading-[1.85] text-reading">
            <p>
              DORIS TV exists to change that. We are building an editorial and community home for
              independent African cinema: a place where filmmakers are represented professionally,
              where their work is written about with care, and where people who love film can meet
              each other.
            </p>
            <p>
              We believe the conversation around a film is part of the film&apos;s life. Good criticism,
              honest production writing and generous discussion are how a cinema builds a memory,
              and how the next generation of filmmakers finds the ones who came before.
            </p>
          </Reveal>
        </PageContainer>
      </section>

      <section className="border-t border-border bg-[#141414]" aria-label="What we are building and why">
        <PageContainer width="wide" className="grid gap-12 py-20 md:grid-cols-2 md:gap-20">
          <div>
            <Eyebrow>What we&apos;re building</Eyebrow>
            <h2 className="type-display-md mt-3">A curated cultural destination.</h2>
            <p className="mt-5 leading-relaxed text-reading/70">
              Not a generic social network, and not a catalogue. A carefully edited site where
              stories, people and conversation sit side by side, and where quality comes before
              volume.
            </p>
          </div>
          <div>
            <Eyebrow>Why it matters</Eyebrow>
            <h2 className="type-display-md mt-3">Visibility changes what gets made.</h2>
            <p className="mt-5 leading-relaxed text-reading/70">
              When filmmakers are discoverable and their work is taken seriously, they find
              collaborators, audiences and the confidence to keep going. Independent film depends on
              that ecosystem as much as on cameras and budgets.
            </p>
          </div>
        </PageContainer>
      </section>

      <section aria-label="How DORIS TV works" className="border-t border-border">
        <PageContainer width="wide" className="py-20">
          <div className="grid gap-px bg-border md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.n} className="flex flex-col bg-background p-8 sm:p-10">
                <span className="font-display text-5xl font-black text-white/15">{p.n}</span>
                <h2 className="mt-6 font-display text-2xl font-black">{p.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                <Link href={p.href} className="mt-6 w-fit border-b border-gold pb-0.5 text-xs font-bold uppercase tracking-[0.08em] text-gold">
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section aria-label="Get involved" className="border-t border-border">
        <Filmstrip />
        <PageContainer width="narrow" className="py-20 text-center">
          <Eyebrow>Get involved</Eyebrow>
          <h2 className="type-display-lg mt-4">Be part of it from the start.</h2>
          <p className="mx-auto mt-5 max-w-lg text-reading/60">
            Anyone can join the waitlist. Filmmakers can then apply for a profile, reviewed by our
            team.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/waitlist">Join the waitlist</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/filmmaker-application">Apply as a filmmaker</Link>
            </Button>
          </div>
          <p className="mt-12 text-xs text-muted-foreground">
            DORIS TV is published by Doris Entertainment Networks Limited.
          </p>
        </PageContainer>
      </section>
    </>
  );
}
