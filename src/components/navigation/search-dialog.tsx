"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SearchEntry } from "@/data/repositories/search";

const GROUPS = [
  { type: "journal", label: "Journal" },
  { type: "filmmaker", label: "Filmmakers" },
] as const;

/**
 * Global search. Covers Journal articles and Filmmakers only. Community
 * discussions are intentionally not searchable here.
 */
export function SearchDialog({ index }: { index: SearchEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const results = useMemo(
    () => (q ? index.filter((e) => q.split(/\s+/).every((t) => e.haystack.includes(t))) : []),
    [index, q],
  );

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search Journal and filmmakers">
          <Search className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-[12%] max-w-xl translate-y-0 gap-0 p-0">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search Journal articles and filmmakers.</DialogDescription>
        <div className="border-b border-border p-4">
          <Input
            autoFocus
            type="search"
            aria-label="Search Journal articles and filmmakers"
            placeholder="Search the Journal and filmmakers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].href);
            }}
          />
        </div>
        <div className="max-h-[55vh] overflow-y-auto" aria-live="polite">
          {!q ? (
            <p className="p-6 text-sm text-muted-foreground">
              Search stories by title, author or topic, and filmmakers by name, country or discipline.
            </p>
          ) : results.length === 0 ? (
            <div className="p-6">
              <p className="font-semibold">No results for “{query.trim()}”</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Check the spelling or try a broader term. Search covers Journal articles and filmmakers.
              </p>
            </div>
          ) : (
            GROUPS.map((g) => {
              const items = results.filter((r) => r.type === g.type).slice(0, 6);
              if (!items.length) return null;
              return (
                <section key={g.type} aria-label={g.label}>
                  <h2 className="type-eyebrow px-6 pt-5 font-sans text-gold">{g.label}</h2>
                  <ul className="py-2">
                    {items.map((r) => (
                      <li key={r.href}>
                        <button
                          type="button"
                          onClick={() => go(r.href)}
                          className="w-full px-6 py-2.5 text-left transition-colors hover:bg-white/5 focus-visible:bg-white/5"
                        >
                          <span className="block text-sm font-semibold leading-snug">{r.title}</span>
                          <span className="block text-xs text-muted-foreground">{r.subtitle}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
