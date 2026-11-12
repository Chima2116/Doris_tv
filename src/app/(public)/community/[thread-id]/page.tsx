import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { getDiscussionById, getDiscussions, getMembers, getReplies } from "@/data/repositories/discussions";
import { DiscussionThread } from "@/features/community/discussion-thread";

export async function generateMetadata(props: PageProps<"/community/[thread-id]">): Promise<Metadata> {
  const { "thread-id": id } = await props.params;
  const d = await getDiscussionById(id);
  return d ? { title: d.title, description: d.body.slice(0, 160) } : { title: "Discussion" };
}

/**
 * Not-found is handled on the client: discussions created in this prototype live in
 * browser storage, so the server can't know every valid id.
 */
export default function ThreadPage(props: PageProps<"/community/[thread-id]">) {
  return (
    <PageContainer width="wide" className="py-12 sm:py-16">
      <Suspense fallback={<ThreadSkeleton />}>
        <Thread params={props.params} />
      </Suspense>
    </PageContainer>
  );
}

async function Thread({ params }: { params: PageProps<"/community/[thread-id]">["params"] }) {
  const { "thread-id": id } = await params;
  const [discussions, replies, members] = await Promise.all([getDiscussions(), getReplies(), getMembers()]);
  return <DiscussionThread id={id} seedDiscussions={discussions} seedReplies={replies} members={members} />;
}

function ThreadSkeleton() {
  return (
    <div className="max-w-3xl space-y-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
