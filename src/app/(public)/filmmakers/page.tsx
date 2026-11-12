import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApplications } from "@/data/repositories/applications";
import { getAllFilmmakers } from "@/data/repositories/filmmakers";
import { DirectoryView } from "@/features/filmmakers/directory-view";

export const metadata: Metadata = {
  title: "Filmmakers",
  description: "A directory of independent African filmmakers: directors, writers, cinematographers, editors, producers and composers.",
};

export default function FilmmakersPage() {
  return (
    <PageContainer width="wide" className="py-14 sm:py-20">
      <header className="mb-12 max-w-4xl">
        <p className="tag text-white/60">Filmmaker directory</p>
        <h1 className="display-name mt-4 text-[clamp(2.25rem,5.5vw,4.5rem)]">The people making African cinema.</h1>
        <p className="mt-5 text-lg leading-relaxed text-white/70">
          Professional profiles of independent filmmakers: their work, their credits and their
          creative thinking. Not a film catalogue, but a way to find the people behind the films.
        </p>
      </header>
      <Suspense fallback={<DirectorySkeleton />}>
        <Directory />
      </Suspense>
      <aside className="mt-24 flex flex-col items-start justify-between gap-6 bg-[#1c1c1c] p-8 sm:flex-row sm:items-center sm:p-12">
        <div>
          <h2 className="heading-section">Are you a filmmaker?</h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-white/65">
            Join the waitlist, then apply for a profile. Applications are reviewed by the DORIS TV
            team.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/filmmaker-application">Apply for a profile</Link>
        </Button>
      </aside>
    </PageContainer>
  );
}

async function Directory() {
  const [seed, applications] = await Promise.all([getAllFilmmakers(), getApplications()]);
  return <DirectoryView seed={seed} seedApplications={applications} />;
}

function DirectorySkeleton() {
  return (
    <div>
      <Skeleton className="h-11 w-full" />
      <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full" />
        ))}
      </div>
    </div>
  );
}
