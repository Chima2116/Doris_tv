import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { WaitlistForm } from "@/features/waitlist/waitlist-form";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description: "Be among the first members of DORIS TV, the home of independent African film.",
};

const PERKS = [
  ["Follow", "filmmakers and members whose work you care about."],
  ["Save", "Journal stories to a personal reading list."],
  ["Join", "the Community: start discussions, reply and react."],
  ["Apply", "for a verified filmmaker profile, reviewed by our team."],
];

export default function WaitlistPage() {
  return (
    <PageContainer width="wide" className="grid gap-14 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
      <div>
        <p className="tag text-white/60">Membership</p>
        <h1 className="display-name mt-4 text-[clamp(2.25rem,5vw,4rem)]">Be among the first.</h1>
        <p className="mt-6 max-w-lg text-lg text-reading/65">
          DORIS TV is a home for independent African cinema: a Journal, a directory of filmmakers
          and a community built around the work. Anyone can join the waitlist.
        </p>
        <ul className="mt-10 max-w-lg divide-y divide-border border-y border-border">
          {PERKS.map(([k, v]) => (
            <li key={k} className="flex gap-5 py-4">
              <span className="w-16 shrink-0 text-lg font-bold">{k}</span>
              <span className="text-reading/80">{v}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <WaitlistForm />
      </div>
    </PageContainer>
  );
}
