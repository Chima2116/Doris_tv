import { Badge } from "@/components/ui/badge";

type Variant = React.ComponentProps<typeof Badge>["variant"];

/** One place that maps domain statuses to labels and colours. */
const STATUS: Record<string, { label: string; variant: Variant }> = {
  // applications
  draft: { label: "Draft", variant: "outline" },
  submitted: { label: "Submitted", variant: "outline" },
  under_review: { label: "Under review", variant: "outline" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  // revisions
  pending: { label: "Pending review", variant: "outline" },
  // accounts
  active: { label: "Active", variant: "success" },
  restricted: { label: "Restricted", variant: "warning" },
  suspended: { label: "Suspended", variant: "destructive" },
  deleted: { label: "Deleted", variant: "outline" },
  // content
  published: { label: "Published", variant: "success" },
  scheduled: { label: "Scheduled", variant: "outline" },
  hidden: { label: "Hidden", variant: "outline" },
  unpublished: { label: "Unpublished", variant: "outline" },
  // reports
  open: { label: "Open", variant: "outline" },
  cleared: { label: "Cleared", variant: "outline" },
  escalated: { label: "Escalated", variant: "destructive" },
  resolved: { label: "Resolved", variant: "success" },
  // verification & sign-up
  verified: { label: "Verified", variant: "success" },
  unverified: { label: "Unverified", variant: "outline" },
  registered: { label: "Registered", variant: "outline" },
  linked: { label: "Linked", variant: "success" },
  invited: { label: "Invited", variant: "outline" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = STATUS[status] ?? { label: status.replace(/_/g, " "), variant: "outline" as Variant };
  return (
    <Badge variant={s.variant} className={className}>
      {s.label}
    </Badge>
  );
}
