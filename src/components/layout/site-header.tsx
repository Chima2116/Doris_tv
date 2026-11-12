import { Wordmark } from "@/components/shared/wordmark";
import { NavLinks } from "@/components/navigation/nav-links";
import { PUBLIC_NAV } from "@/components/navigation/nav-config";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { SearchDialog } from "@/components/navigation/search-dialog";
import { UserMenu } from "@/components/navigation/user-menu";
import { getSearchIndex } from "@/data/repositories/search";

export async function SiteHeader() {
  const searchIndex = await getSearchIndex();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-6 lg:px-8">
        <Wordmark />
        <nav aria-label="Primary" className="hidden lg:block">
          <NavLinks items={PUBLIC_NAV} className="flex items-center gap-8" />
        </nav>
        <div className="flex items-center gap-1">
          <SearchDialog index={searchIndex} />
          <UserMenu />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
