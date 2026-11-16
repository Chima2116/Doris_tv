import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Photo } from "@/components/shared/photo";
import { IMAGES } from "@/data/images";
import { PageContainer } from "@/components/shared/page-container";
import { Reveal } from "@/components/shared/reveal";
import { getAboutCopy } from "@/data/repositories/site-copy";

export const metadata: Metadata = {
  title: "About",
  description:
    "DORIS TV is an editorial and community home for independent African cinema: the Journal, filmmaker profiles and a community built around the work.",
};

/** Where each pillar links. The wording comes from the Studio; the destinations stay in code. */
const PILLAR_HREFS = ["/journal", "/filmmakers", "/community"];

export default async function AboutPage() {
  const c = await getAboutCopy();
  // The same photograph as the home hero, cropped to the market scene on the right.
  const img = { ...IMAGES.homeHero, focal: "82% 55%" };
  return (
    <>
      <section aria-label="About DORIS TV" className="grid lg:min-h-[36rem] lg:grid-cols-12">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:col-span-7 lg:px-16 xl:px-24">
          <p className="tag text-white/60">{c.eyebrow}</p>
          <h1 className="display-name mt-5 max-w-[18ch] text-[clamp(2.25rem,5.5vw,4.75rem)]">{c.headline}</h1>
        </div>
        <div className="relative min-h-[18rem] lg:col-span-5">
          <Photo asset={img} fill priority sizes="(min-width: 1024px) 42vw, 100vw" />
        </div>
      </section>

      <section aria-label="Manifesto" className="bg-[#1c1c1c]">
        <PageContainer width="narrow" className="py-20 sm:py-28">
          <Reveal>
            <p className="text-[clamp(1.5rem,3.4vw,2.5rem)] font-bold leading-[1.2] tracking-tight text-balance">{c.manifestoLead}</p>
          </Reveal>
          <Reveal delay={0.05} className="mt-10 space-y-6 text-lg leading-[1.85] text-reading">
            {c.manifestoParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
        </PageContainer>
      </section>

      <section aria-label="What we are building and why">
        <PageContainer width="wide" className="grid gap-12 py-20 md:grid-cols-2 md:gap-20">
          <Reveal>
            <p className="tag text-white/60">[1] {c.buildingLabel}</p>
            <h2 className="heading-section mt-3">{c.buildingHeadline}</h2>
            <p className="mt-5 leading-relaxed text-white/70">{c.buildingText}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="tag text-white/60">[2] {c.whyLabel}</p>
            <h2 className="heading-section mt-3">{c.whyHeadline}</h2>
            <p className="mt-5 leading-relaxed text-white/70">{c.whyText}</p>
          </Reveal>
        </PageContainer>
      </section>

      <section aria-label="How DORIS TV works" className="bg-[#141414]">
        <PageContainer width="wide" className="py-20">
          <ol className="grid gap-10 md:grid-cols-3">
            {c.pillars.map((p, i) => (
              <li key={i} className="group flex flex-col border-t border-white/25 pt-6">
                <span className="meta tabular-nums text-white/60">[{i + 1}]</span>
                <h2 className="heading-feature mt-4 text-2xl">{p.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/65">{p.body}</p>
                <Link href={PILLAR_HREFS[i] ?? "/"} className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold underline decoration-white/40 underline-offset-[6px] hover:decoration-white">
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
          <h2 className="display-name mt-4 text-[clamp(2rem,4.5vw,3.5rem)]">{c.involvedHeadline}</h2>
          <p className="mt-5 max-w-lg text-white/70">{c.involvedText}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="gold">
              <Link href="/sign-up">Create a free account</Link>
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
