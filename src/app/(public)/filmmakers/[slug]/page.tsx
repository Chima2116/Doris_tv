import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { getApplications } from "@/data/repositories/applications";
import { getArticles } from "@/data/repositories/articles";
import { getAllFilmmakers, getFilmmakerBySlug } from "@/data/repositories/filmmakers";
import { FilmmakerProfileView } from "@/features/filmmakers/filmmaker-profile";

export async function generateMetadata(props: PageProps<"/filmmakers/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const f = await getFilmmakerBySlug(slug);
  if (!f) return { title: "Filmmaker" };
  return {
    title: f.name,
    description: `${f.primaryDiscipline} from ${f.country}. ${f.tagline ?? ""}`.trim(),
  };
}

/**
 * The profile is resolved on the client so approved revisions and newly approved filmmakers
 * (which live in browser storage in this prototype) show up. Unknown slugs render a
 * not-found panel rather than a server 404 for the same reason.
 */
export default function FilmmakerPage(props: PageProps<"/filmmakers/[slug]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <FilmmakerContent params={props.params} />
    </Suspense>
  );
}

function ProfileSkeleton() {
  return (
    <PageContainer width="wide" className="grid gap-10 py-14 md:grid-cols-[5fr_7fr]">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="space-y-4 self-end">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </PageContainer>
  );
}

async function FilmmakerContent({ params }: { params: PageProps<"/filmmakers/[slug]">["params"] }) {
  const { slug } = await params;
  const [seed, applications, articles] = await Promise.all([getAllFilmmakers(), getApplications(), getArticles()]);
  return <FilmmakerProfileView slug={slug} seed={seed} seedApplications={applications} articles={articles} />;
}
