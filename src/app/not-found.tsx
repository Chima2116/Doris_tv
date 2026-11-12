import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/shared/eyebrow";
import { PageContainer } from "@/components/shared/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageContainer width="narrow" className="py-28 text-center">
          <Eyebrow>Error 404</Eyebrow>
          <h1 className="type-display-lg mt-4">This scene is missing.</h1>
          <p className="mx-auto mt-5 max-w-md text-reading/65">
            The page you were looking for doesn&apos;t exist or has moved. Try the Journal or the
            filmmaker directory instead.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link href="/journal">Read the Journal</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/filmmakers">Browse filmmakers</Link></Button>
          </div>
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  );
}
