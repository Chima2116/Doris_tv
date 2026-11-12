import { Badge } from "@/components/ui/badge";

type Variant = React.ComponentProps<typeof Badge>["variant"];

/** One place that maps domain statuses to labels and colours. */
const STATUS: Record<string, { label: string; variant: Variant }> = {
  // applications
  draft: { label: "Draft", variant: "outline" },
  submitted: { label: "Submitted", variant: "gold" },
  under_review: { label: "Under review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  // revisions
  pending: { label: "Pending review", variant: "warning" },
  // accounts
  active: { label: "Active", variant: "success" },
  restricted: { label: "Restricted", variant: "warning" },
  suspended: { label: "Suspended", variant: "destructive" },
  deleted: { label: "Deleted", variant: "outline" },
  // content
  published: { label: "Published", variant: "success" },
  scheduled: { label: "Scheduled", variant: "gold" },
  hidden: { label: "Hidden", variant: "warning" },
  unpublished: { label: "Unpublished", variant: "outline" },
  // reports
  open: { label: "Open", variant: "warning" },
  cleared: { label: "Cleared", variant: "outline" },
  escalated: { label: "Escalated", variant: "destructive" },
  resolved: { label: "Resolved", variant: "success" },
  // verification & waitlist
  verified: { label: "Verified", variant: "success" },
  unverified: { label: "Unverified", variant: "outline" },
  registered: { label: "Registered", variant: "outline" },
  linked: { label: "Linked", variant: "success" },
  invited: { label: "Invited", variant: "gold" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = STATUS[status] ?? { label: status.replace(/_/g, " "), variant: "outline" as Variant };
  return (
    <Badge variant={s.variant} className={className}>
      {s.label}
    </Badge>
  );
}
