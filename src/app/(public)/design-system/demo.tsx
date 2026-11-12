"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArtImage } from "@/components/shared/art-image";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Filmstrip } from "@/components/shared/filmstrip";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Wordmark } from "@/components/shared/wordmark";
import { useSession } from "@/features/auth/session-provider";
import { checkGate, type GateAction } from "@/lib/permissions";

const SWATCHES = [
  ["Background", "#0D0D0D", "bg-background border border-border"],
  ["Foreground", "#FFFFFF", "bg-foreground"],
  ["Reading text", "#F0EDE6", "bg-reading"],
  ["Surface", "#1C1C1C", "bg-surface border border-border"],
  ["Elevated", "#262626", "bg-elevated border border-border"],
  ["Gold", "#E8A020", "bg-gold"],
  ["Muted", "#A3A3A3", "bg-muted-foreground"],
  ["Border", "#333333", "bg-border"],
  ["Success", "#3E9B69", "bg-success"],
  ["Warning", "#D99A32", "bg-warning"],
  ["Danger", "#D65353", "bg-danger"],
] as const;

const STATUSES = [
  "draft", "submitted", "under_review", "approved", "rejected", "pending",
  "active", "suspended", "published", "hidden", "escalated", "verified",
];

const GATES: GateAction[] = ["follow", "save", "react", "reply", "create_discussion", "report"];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-12">
      <SectionHeader title={title} as="h2" />
      {children}
    </section>
  );
}

export function DesignSystemDemo() {
  const { requestAction, user } = useSession();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <PageContainer className="py-16">
      <Eyebrow>Development reference</Eyebrow>
      <h1 className="type-display-lg mt-3">Design system</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Tokens and shared components for DORIS TV. This page exists in development only. Palette
        proportion target: 70% black, 25% white, 5% gold.
      </p>

      <Block title="Colour">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SWATCHES.map(([name, hex, cls]) => (
            <li key={name}>
              <div className={`h-20 ${cls}`} />
              <p className="mt-2 text-sm font-semibold">{name}</p>
              <p className="text-xs text-muted-foreground">{hex}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Typography">
        <div className="space-y-6">
          <p className="type-display-xl">Display XL</p>
          <p className="type-display-lg">Display large headline</p>
          <p className="type-display-md">Display medium for section titles</p>
          <Eyebrow>Eyebrow label</Eyebrow>
          <p className="max-w-prose text-lg leading-relaxed text-reading">
            Body copy is set in Inter at a comfortable measure. It uses the warm reading tone so
            long articles stay easy on the eye against the black ground.
          </p>
          <p className="text-sm text-muted-foreground">Muted supporting text for metadata and captions.</p>
        </div>
      </Block>

      <Block title="Brand">
        <div className="space-y-6">
          <Wordmark size="lg" />
          <Filmstrip />
        </div>
      </Block>

      <Block title="Buttons and badges">
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                toast.success("Saved (simulated)");
              }, 1200);
            }}
            disabled={loading}
          >
            {loading ? "Saving…" : "Loading demo"}
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="gold">Gold</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Danger</Badge>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </Block>

      <Block title="Form controls">
        <form className="grid max-w-xl gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-2">
            <Label htmlFor="ds-name">Full name</Label>
            <Input id="ds-name" placeholder="Amina Diallo" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ds-email">Email</Label>
            <Input id="ds-email" type="email" aria-invalid aria-describedby="ds-email-err" defaultValue="not-an-email" />
            <p id="ds-email-err" role="alert" className="text-sm text-danger">
              Enter a valid email address.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ds-country">Country</Label>
            <Select>
              <SelectTrigger id="ds-country" className="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {["Nigeria", "Ghana", "Kenya", "Senegal", "South Africa"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ds-bio">Biography</Label>
            <Textarea id="ds-bio" rows={4} />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="ds-terms" />
            <Label htmlFor="ds-terms">I agree to the community guidelines</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="ds-private" />
            <Label htmlFor="ds-private">Hide my activity from other members</Label>
          </div>
        </form>
      </Block>

      <Block title="Dialogs, gating and feedback">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setConfirm(true)}>Confirm dialog</Button>
          <Button variant="outline" onClick={() => toast("Neutral toast")}>Toast</Button>
          <Button variant="outline" onClick={() => toast.error("Something went wrong (simulated)")}>Error toast</Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Gated actions as <strong className="text-foreground">{user ? user.displayName : "a guest"}</strong>.
          Switch identity with the demo switcher (bottom left) and try each:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {GATES.map((g) => (
            <Button
              key={g}
              size="sm"
              variant="secondary"
              onClick={() =>
                requestAction(g, () =>
                  toast.success(`Action completed: ${g.replace("_", " ")}`),
                )
              }
            >
              {g.replace("_", " ")}
              {!checkGate(user, g).allowed && <span aria-hidden="true">🔒</span>}
            </Button>
          ))}
        </div>
        <ConfirmDialog
          open={confirm}
          onOpenChange={setConfirm}
          title="Delete this discussion?"
          description="It will be hidden from the public feed. This is a soft delete in the prototype."
          confirmLabel="Delete discussion"
          destructive
          onConfirm={() => toast.success("Discussion deleted (simulated)")}
        />
      </Block>

      <Block title="Image placeholders and empty states">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {["Lagos", "Dakar", "Nairobi", "Accra", "Cairo", "Kigali", "Cape Town", "Addis"].map((s, i) => (
            <ArtImage key={s} alt={`Placeholder art ${s}`} seed={s} ghost={String(i + 1).padStart(2, "0")} aspect="aspect-[3/4]" />
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <EmptyState
            icon={<Inbox />}
            title="Nothing saved yet"
            description="Save Journal stories to read later and they'll collect here."
            action={{ label: "Browse the Journal", href: "/journal" }}
          />
          <div className="space-y-3 border border-border p-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </Block>
    </PageContainer>
  );
}
