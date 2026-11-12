import Link from "next/link";
import { Wordmark } from "@/components/shared/wordmark";
import { Filmstrip } from "@/components/shared/filmstrip";
import { PageContainer } from "@/components/shared/page-container";

/** Footer deliberately has no Archive, Submit-a-film or Reviews links (Stage 1 scope). */
const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Journal", href: "/journal" },
      { label: "Filmmakers", href: "/filmmakers" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Join the waitlist", href: "/waitlist" },
      { label: "Apply as a filmmaker", href: "/filmmaker-application" },
    ],
  },
] as const;

const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "YouTube", href: "https://www.youtube.com/" },
  { label: "X / Twitter", href: "https://x.com/" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-[#141414]">
      <Filmstrip />
      <PageContainer width="wide" className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="max-w-xs space-y-4">
            <Wordmark size="lg" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              A home for independent African cinema: editorial writing, filmmaker profiles and a
              community of people who care about African film.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-4 font-sans type-eyebrow text-gold">{col.title}</h2>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <nav aria-label="Connect">
            <h2 className="mb-4 font-sans type-eyebrow text-gold">Connect</h2>
            <ul className="space-y-2.5">
              {SOCIAL.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© 2026 Doris Entertainment Networks Limited. All rights reserved.</p>
          <p>Where Independent African Film Lives.</p>
        </div>
      </PageContainer>
    </footer>
  );
}
