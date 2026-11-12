"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { filmmakerFilterOptions, filterFilmmakers } from "@/data/repositories/filmmakers";
import type { Filmmaker, FilmmakerApplication } from "@/data/types";
import { DirectoryFilters } from "./directory-filters";
import { FilmmakerCard } from "./filmmaker-card";
import { useFilmmakers } from "./use-public-filmmakers";

const PAGE_SIZE = 12;

/** Directory results. Reflects approved profile revisions and newly approved filmmakers. */
export function DirectoryView({ seed, seedApplications }: { seed: Filmmaker[]; seedApplications: FilmmakerApplication[] }) {
  const sp = useSearchParams();
  const { published } = useFilmmakers(seed, seedApplications);
  const get = (k: string) => sp.get(k) ?? undefined;
  const filters = { q: get("q"), country: get("country"), discipline: get("discipline"), since: get("since") };

  const options = filmmakerFilterOptions(published);
  const results = filterFilmmakers(published, filters);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(get("page")) || 1), totalPages);
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <DirectoryFilters options={options} />
      <p className="mt-8 text-sm text-muted-foreground" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? "filmmaker" : "filmmakers"}
      </p>
      {visible.length === 0 ? (
        <div className="mt-4 flex flex-col items-center border border-dashed border-border px-6 py-20 text-center">
          <h2 className="font-display text-xl font-black">No filmmakers match your search</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Try a different spelling, remove a filter, or widen the years active. Search covers filmmaker names only.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/filmmakers">Clear all filters</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {visible.map((f) => (
            <li key={f.id}>
              <FilmmakerCard filmmaker={f} />
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/filmmakers"
        params={{ q: filters.q, country: filters.country, discipline: filters.discipline, since: filters.since }}
      />
    </>
  );
}
