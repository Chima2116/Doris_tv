import Link from "next/link";
import { Wordmark } from "@/components/shared/wordmark";

/** Footer is deliberately small: no Archive, Submit-a-film or Reviews links (Stage 1 scope). */
const COLUMNS = [
  { title: "Read", links: [["Journal", "/journal"], ["Filmmakers", "/filmmakers"], ["Community", "/community"]] },
  { title: "DORIS TV", links: [["About", "/about"], ["Create a free account", "/sign-up"], ["Apply as a filmmaker", "/filmmaker-application"]] },
] as const;

/** DORIS TV social accounts. */
const SOCIAL = [
  ["YouTube", "https://youtube.com/@dorisentertainment-s1v"],
  ["Instagram", "https://www.instagram.com/doris.films/"],
  ["LinkedIn", "https://www.linkedin.com/in/doris-tv-142902432"],
  ["X", "https://x.com/dorisfilms"],
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-gold bg-[#0a0a0a]">
      <div className="mx-auto grid w-full max-w-[1360px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-12">
        <div>
          <Wordmark size="md" />
          <p className="mt-5 max-w-[22rem] text-sm leading-relaxed text-white/60">
            A journal, a directory and a community for independent Nigerian and African cinema.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="tag mb-4 text-white/60">{col.title}</h2>
            <ul className="space-y-2.5 text-sm">
              {col.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="text-white/80 transition-colors duration-200 hover:text-gold">{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
        <nav aria-label="Follow">
          <h2 className="tag mb-4 text-white/60">Follow</h2>
          <ul className="space-y-2.5 text-sm">
            {SOCIAL.map(([label, href]) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-white/80 transition-colors duration-200 hover:text-gold">
                  {label}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-gold/30">
        <div className="mx-auto flex w-full max-w-[1360px] flex-wrap justify-between gap-x-8 gap-y-2 px-5 py-5 text-xs text-white/60 sm:px-8 lg:px-12">
          <p>© 2026 Doris Entertainment Networks Limited</p>
          <p>Demonstration content: the stories, people and films shown are fictional.</p>
        </div>
      </div>
    </footer>
  );
}
