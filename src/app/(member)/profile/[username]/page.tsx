import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { getArticles } from "@/data/repositories/articles";
import {
  getDiscussions,
  getMemberByUsername,
  getMembers,
  getReplies,
} from "@/data/repositories/discussions";
import { getFilmmakers } from "@/data/repositories/filmmakers";
import { ProfileView } from "@/features/members/profile-view";

export async function generateStaticParams() {
  return (await getMembers()).map((m) => ({ username: m.username }));
}

export async function generateMetadata(props: PageProps<"/profile/[username]">): Promise<Metadata> {
  const { username } = await props.params;
  const m = await getMemberByUsername(username);
  // Private profiles stay discoverable but their bio is never put in metadata.
  return m ? { title: `${m.displayName} (@${m.username})` } : { title: "Member not found" };
}

export default function ProfilePage(props: PageProps<"/profile/[username]">) {
  return (
    <Suspense
      fallback={
        <PageContainer className="py-16">
          <Skeleton className="h-28 w-full" />
        </PageContainer>
      }
    >
      <Profile params={props.params} />
    </Suspense>
  );
}

async function Profile({ params }: { params: PageProps<"/profile/[username]">["params"] }) {
  const { username } = await params;
  const member = await getMemberByUsername(username);
  if (!member) notFound();
  const [discussions, replies, members, articles, filmmakers] = await Promise.all([
    getDiscussions(),
    getReplies(),
    getMembers(),
    getArticles(),
    getFilmmakers(),
  ]);
  return (
    <ProfileView
      seed={member}
      seedDiscussions={discussions}
      seedReplies={replies}
      members={members}
      articles={articles}
      filmmakers={filmmakers}
    />
  );
}
