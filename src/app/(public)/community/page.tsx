import type { Metadata } from "next";
import { Suspense } from "react";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { getDiscussions, getMembers, getReplies } from "@/data/repositories/discussions";
import { CommunityFeed } from "@/features/community/community-feed";

export const metadata: Metadata = {
  title: "Community",
  description: "Discussions about independent African cinema: craft, festivals, distribution and recommendations.",
};

export default async function CommunityPage() {
  const [discussions, replies, members] = await Promise.all([getDiscussions(), getReplies(), getMembers()]);
  return (
    <PageContainer width="wide" className="py-14 sm:py-20">
      <header className="mb-12 max-w-3xl">
        <Eyebrow>Community</Eyebrow>
        <h1 className="type-display-lg mt-4">Talk about the work.</h1>
        <p className="mt-5 text-lg text-reading/60">
          Conversations among people who care about independent African cinema: craft, festivals,
          distribution and what to watch. Everyone can read; members take part.
        </p>
      </header>
      <Suspense fallback={<FeedSkeleton />}>
        <CommunityFeed seedDiscussions={discussions} seedReplies={replies} members={members} />
      </Suspense>
    </PageContainer>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
