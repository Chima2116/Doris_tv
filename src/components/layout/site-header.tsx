import { Wordmark } from "@/components/shared/wordmark";
import { NavLinks } from "@/components/navigation/nav-links";
import { PUBLIC_NAV } from "@/components/navigation/nav-config";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { SearchDialog } from "@/components/navigation/search-dialog";
import { UserMenu } from "@/components/navigation/user-menu";
import { getSearchIndex } from "@/data/repositories/search";

/** Slim masthead: wordmark, four quiet text links, and member actions. No buttons, no fills. */
export async function SiteHeader() {
  const searchIndex = await getSearchIndex();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background">
      <div className="mx-auto grid h-14 w-full max-w-[1360px] grid-cols-[1fr_auto] items-center gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-12">
        <Wordmark size="sm" />
        <nav aria-label="Primary" className="hidden lg:block">
          <NavLinks items={PUBLIC_NAV} className="flex items-center gap-9" />
        </nav>
        <div className="flex items-center justify-end gap-1">
          <SearchDialog index={searchIndex} />
          <UserMenu />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
