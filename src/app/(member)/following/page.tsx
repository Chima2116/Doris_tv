import type { Metadata } from "next";
import { PageContainer } from "@/components/shared/page-container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { getMembers } from "@/data/repositories/discussions";
import { getFilmmakers } from "@/data/repositories/filmmakers";
import { FollowingList } from "@/features/members/following-list";

// Role-gated on the client (simulated), so children aren't rendered for guests.
export const instant = false;

export const metadata: Metadata = { title: "Following" };

export default async function FollowingPage() {
  const [filmmakers, members] = await Promise.all([getFilmmakers(), getMembers()]);
  return (
    <PageContainer width="wide" className="py-12 sm:py-16">
      <header className="mb-10">
        <Eyebrow>Your network</Eyebrow>
        <h1 className="type-display-lg mt-3">Following</h1>
      </header>
      <FollowingList filmmakers={filmmakers} members={members} />
    </PageContainer>
  );
}
