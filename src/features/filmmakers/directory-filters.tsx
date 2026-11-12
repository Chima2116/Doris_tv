"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Options = {
  countries: string[];
  disciplines: string[];
  since: readonly { value: string; label: string }[];
};

const ALL = "__all";

/**
 * Directory search and filters. State lives in the URL so filtered views are
 * shareable and survive refresh. Search is debounced.
 */
export function DirectoryFilters({ options }: { options: Options }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Keep the box in sync if the URL changes externally (clear, back button).
  const urlQ = params.get("q") ?? "";
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQ(urlQ);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const activeCount = ["country", "discipline", "since"].filter((k) => params.get(k)).length;
  const hasAny = activeCount > 0 || !!params.get("q");

  const filter = (id: string, label: string, key: string, items: { value: string; label: string }[]) => (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="type-eyebrow text-muted-foreground">
        {label}
      </Label>
      <Select value={params.get(key) ?? ALL} onValueChange={(v) => update(key, v === ALL ? null : v)}>
        <SelectTrigger id={id} className="h-11 w-full min-w-44 bg-surface">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {items.map((i) => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4" role="search" aria-label="Filmmaker directory">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Label htmlFor="fm-search" className="sr-only">
            Search filmmakers by name
          </Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="fm-search"
            type="search"
            value={q}
            placeholder="Search by name"
            className="pl-10"
            onChange={(e) => {
              setQ(e.target.value);
              clearTimeout(timer.current);
              timer.current = setTimeout(() => update("q", e.target.value.trim() || null), 250);
            }}
          />
        </div>
        <Button
          variant="outline"
          className="md:hidden"
          aria-expanded={open}
          aria-controls="fm-filters"
          onClick={() => setOpen((o) => !o)}
        >
          <SlidersHorizontal aria-hidden="true" />
          Filters{activeCount > 0 && ` (${activeCount})`}
        </Button>
      </div>

      <div
        id="fm-filters"
        className={cn("grid-cols-1 items-end gap-4 sm:grid-cols-3 md:grid", open ? "grid" : "hidden")}
      >
        {filter("fm-country", "Country", "country", options.countries.map((c) => ({ value: c, label: c })))}
        {filter("fm-discipline", "Discipline", "discipline", options.disciplines.map((c) => ({ value: c, label: c })))}
        {filter("fm-since", "Years active", "since", options.since.map((s) => ({ value: s.value, label: `Since the ${s.label}` })))}
      </div>

      {hasAny && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setQ("");
            router.replace(pathname, { scroll: false });
          }}
        >
          <X aria-hidden="true" /> Clear all filters
        </Button>
      )}
    </div>
  );
}
