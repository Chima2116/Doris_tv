"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth/session-provider";
import type { ReportReason } from "@/data/types";
import { community, useCommunityState } from "./community-store";

const REASONS: { value: ReportReason; label: string; hint: string }[] = [
  { value: "spam", label: "Spam or promotion", hint: "Unrelated links, repeated posts or ads." },
  { value: "harassment", label: "Harassment or abuse", hint: "Targets or demeans a person or group." },
  { value: "off_topic", label: "Off topic", hint: "Not about independent African cinema." },
  { value: "misinformation", label: "Misinformation", hint: "Presents false claims as fact." },
  { value: "other", label: "Something else", hint: "Tell us more below." },
];

export function ReportButton({ type, id, authorId }: { type: "discussion" | "reply"; id: string; authorId: string }) {
  const { user, requestAction } = useSession();
  const state = useCommunityState();
  const [open, setOpen] = useState(false);
  const [reporter, setReporter] = useState<string | null>(null);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user?.id === authorId) return null; // can't report your own post
  const already = !!user && state.reports.some((r) => r.reporterId === user.id && r.target.id === id);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        disabled={already}
        onClick={() =>
          requestAction("report", (m) => {
            setReporter(m.id);
            setOpen(true);
          })
        }
      >
        <Flag aria-hidden="true" /> {already ? "Reported" : "Report"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!reason) {
                setError("Choose a reason so a moderator knows what to look for.");
                return;
              }
              setError(null);
              setBusy(true);
              await new Promise((r) => setTimeout(r, 600));
              community.addReport({
                target: { type, id },
                reporterId: reporter ?? user!.id,
                reason,
                details: details.trim() || undefined,
              });
              setBusy(false);
              setOpen(false);
              setReason("");
              setDetails("");
              toast.success("Report submitted. A moderator will review it.");
            }}
          >
            <DialogHeader>
              <DialogTitle>Report this {type}</DialogTitle>
              <DialogDescription>
                Reports are reviewed by moderators. The author isn&apos;t told who reported them.
              </DialogDescription>
            </DialogHeader>
            <fieldset className="my-5">
              <legend className="sr-only">Reason</legend>
              <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)} className="gap-3">
                {REASONS.map((r) => (
                  <div key={r.value} className="flex items-start gap-3">
                    <RadioGroupItem id={`rr-${r.value}`} value={r.value} className="mt-1" />
                    <Label htmlFor={`rr-${r.value}`} className="grid gap-0.5 font-normal">
                      <span className="font-semibold">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.hint}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </fieldset>
            <div className="grid gap-2">
              <Label htmlFor="report-details">
                Details <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea id="report-details" rows={3} maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm text-[#ee8585]">
                {error}
              </p>
            )}
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Submitting…" : "Submit report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
