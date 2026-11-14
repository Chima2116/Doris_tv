"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth/session-provider";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

/** Operational admin chrome: dense, plain, scannable. Distinct from the editorial site. */

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-black sm:text-3xl">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function PrototypeNote({ children }: { children: React.ReactNode }) {
  return <p className="mb-6 border border-dashed border-border px-4 py-2.5 text-xs text-muted-foreground">{children}</p>;
}

export function StatCard({ label, value, hint, href, tone }: { label: string; value: React.ReactNode; hint?: string; href?: string; tone?: "warn" }) {
  const inner = (
    <div className={cn("h-full border border-border bg-surface p-4 transition-colors", href && "hover:border-gold", tone === "warn" && "border-warning/50")}>
      <p className="type-eyebrow text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-display text-3xl font-black", tone === "warn" ? "text-warning" : "text-foreground")}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

/** Horizontally scrollable on small screens so wide tables stay usable. */
export function AdminTable({ children, caption, minWidth = "min-w-[44rem]" }: { children: React.ReactNode; caption: string; minWidth?: string }) {
  return (
    <div className="overflow-x-auto border border-border" tabIndex={0} role="region" aria-label={caption}>
      <table className={cn("w-full border-collapse text-left text-sm", minWidth)}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}
/** Right-aligned cells are the action column: keep them pinned so they stay reachable when a wide table scrolls. */
const pinned = (className?: string) => (className?.includes("text-right") ? "sticky right-0 shadow-[-10px_0_8px_-8px_rgba(0,0,0,0.7)]" : "");
export const Th = ({ className, ...p }: React.ComponentProps<"th">) => (
  <th scope="col" className={cn("border-b border-border bg-surface px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground", pinned(className), className)} {...p} />
);
export const Td = ({ className, ...p }: React.ComponentProps<"td">) => <td className={cn("border-b border-border bg-background px-4 py-3 align-middle", pinned(className), className)} {...p} />;

export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-end gap-3">{children}</div>;
}

export function SearchBox({ value, onChange, label, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder?: string }) {
  return (
    <div className="relative min-w-52 flex-1 sm:max-w-sm">
      <Label htmlFor={`sb-${label}`} className="sr-only">{label}</Label>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input id={`sb-${label}`} type="search" value={value} placeholder={placeholder ?? label} className="h-10 pl-10" onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options, className }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
  return (
    <div className={cn("grid gap-1", className)}>
      <Label htmlFor={`fs-${label}`} className="type-eyebrow text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={`fs-${label}`} className="h-10 min-w-40 bg-surface"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Detail drawer used for every review panel. Structure, top to bottom:
 * kicker (what kind of record), title, subtitle, status badges, a fact strip,
 * then sections separated by hairlines, and a footer with the actions.
 */
export function DetailSheet({
  open, onOpenChange, kicker, title, subtitle, description, badges, facts, children, footer,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  kicker?: string;
  title: string;
  subtitle?: string;
  description?: string;
  badges?: React.ReactNode;
  facts?: { label: string; value: React.ReactNode }[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 bg-[#141414] p-0 sm:max-w-[91.2rem]">
        <header className="border-b border-white/10 px-6 pb-6 pt-7 pr-16 sm:px-8">
          {kicker && <p className="tag text-gold">{kicker}</p>}
          <SheetTitle className="mt-2 font-display text-[1.75rem] font-black leading-[1.1] tracking-tight">{title}</SheetTitle>
          {subtitle && <p className="mt-2 text-sm text-white/60">{subtitle}</p>}
          {badges && <div className="mt-5 flex flex-wrap items-center gap-2">{badges}</div>}
          <SheetDescription className="sr-only">{description ?? subtitle ?? title}</SheetDescription>
        </header>
        {facts && facts.length > 0 && <FactStrip items={facts} />}
        <div className="flex-1 overflow-y-auto px-6 py-2 sm:px-8">{children}</div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-background px-6 py-4 sm:px-8">
            {footer}
          </footer>
        )}
      </SheetContent>
    </Sheet>
  );
}

/** Key facts in a clean grid with hairline dividers. Scannable in a second. */
export function FactStrip({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px border-b border-white/10 bg-white/10 sm:grid-cols-4">
      {items.map((f) => (
        <div key={f.label} className="bg-[#141414] px-6 py-4 sm:px-8">
          <dt className="tag text-white/50">{f.label}</dt>
          <dd className="mt-1.5 text-sm font-semibold text-white">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** One titled block inside a detail drawer. Sections are separated by hairlines, not boxes. */
export function DetailSection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-b border-white/10 py-7 last:border-b-0">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="tag text-white/60">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Quiet emphasis for decisions and notices. Rejections use the danger rule; everything else stays neutral. */
export function DetailCallout({ tone = "neutral", label, children }: { tone?: "neutral" | "danger"; label?: string; children: React.ReactNode }) {
  return (
    <div className={cn("mb-7 border-l-2 pl-5", tone === "danger" ? "border-danger" : "border-white/30")}>
      {label && <p className={cn("tag mb-1.5", tone === "danger" ? "text-[#ee8585]" : "text-white/55")}>{label}</p>}
      <div className="text-[0.9375rem] leading-relaxed text-white/85">{children}</div>
    </div>
  );
}

/** Ordered history. The newest or current step is marked with the brand gold. */
export function DetailTimeline({ items }: { items: { label: string; at?: string; note?: string; current?: boolean }[] }) {
  return (
    <ol className="relative ml-1.5 space-y-5 border-l border-white/15 pl-6">
      {items.map((t, i) => (
        <li key={`${t.label}-${i}`} className="relative">
          <span aria-hidden="true" className={cn("absolute -left-[31px] top-1.5 size-2.5 rounded-full ring-4 ring-[#141414]", t.current ? "bg-gold" : "bg-white/35")} />
          <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
            <span className="font-semibold text-white">{t.label}</span>
            {t.at && <span className="text-xs text-white/50">{t.at}</span>}
          </p>
          {t.note && <p className="mt-1 text-sm text-white/65">{t.note}</p>}
        </li>
      ))}
    </ol>
  );
}

/** A list of rows: primary text on the left, secondary detail on the right. */
export function DetailRows({ rows }: { rows: { primary: React.ReactNode; secondary?: React.ReactNode; end?: React.ReactNode }[] }) {
  return (
    <ul className="divide-y divide-white/10">
      {rows.map((r, i) => (
        <li key={i} className="flex items-baseline justify-between gap-6 py-3">
          <span className="min-w-0 text-sm">
            <span className="font-semibold text-white">{r.primary}</span>
            {r.secondary && <span className="text-white/60"> · {r.secondary}</span>}
          </span>
          {r.end && <span className="shrink-0 text-sm tabular-nums text-white/55">{r.end}</span>}
        </li>
      ))}
    </ul>
  );
}

/** Confirmation that captures a decision reason (shown to the applicant/author where relevant). */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  label = "Reason",
  confirmLabel,
  destructive,
  required = true,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: React.ReactNode;
  label?: string;
  confirmLabel: string;
  destructive?: boolean;
  required?: boolean;
  onConfirm: (reason: string) => void;
  children?: React.ReactNode;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const close = (o: boolean) => {
    if (!o) {
      setReason("");
      setError(null);
    }
    onOpenChange(o);
  };
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (required && reason.trim().length < 5) {
              setError("Please give a short reason (at least 5 characters).");
              return;
            }
            onConfirm(reason.trim());
            close(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="my-5 grid gap-4">
            {children}
            <div className="grid gap-2">
              <Label htmlFor="reason-field">
                {label} {!required && <span className="font-normal text-muted-foreground">(optional)</span>}
              </Label>
              <Textarea id="reason-field" rows={4} value={reason} aria-invalid={!!error} onChange={(e) => setReason(e.target.value)} />
              {error && <p role="alert" className="text-sm text-[#ee8585]">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => close(false)}>Cancel</Button>
            <Button type="submit" variant={destructive ? "destructive" : "default"}>{confirmLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Admin pages render only once persisted client state has loaded, avoiding a flash of seed data. */
export function useAdminReady() {
  const hydrated = useHydrated();
  const { user } = useSession();
  return { ready: hydrated && !!user, actor: user };
}

export function AdminSkeleton() {
  return <div className="h-96 animate-pulse bg-surface" aria-hidden="true" />;
}

export const fmt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
export const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(iso));
