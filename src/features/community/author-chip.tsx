import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/components/navigation/user-menu";
import { cn } from "@/lib/utils";
import type { Member } from "@/data/types";

/** Author identity: avatar, name, handle and any community roles. */
export function AuthorChip({
  member,
  size = "md",
  className,
}: {
  member?: Member;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!member) {
    return <span className={cn("text-sm text-muted-foreground", className)}>Former member</span>;
  }
  const roles = member.roles.filter((r) => r === "moderator" || r === "filmmaker" || r === "admin");
  return (
    <Link
      href={`/profile/${member.username}`}
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <Avatar className={size === "sm" ? "size-7" : "size-10"}>
        <AvatarFallback className="bg-elevated text-[0.7rem] font-bold">{initials(member.displayName)}</AvatarFallback>
      </Avatar>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="text-sm font-semibold group-hover:text-gold">{member.displayName}</span>
        <span className="text-xs text-muted-foreground">@{member.username}</span>
        {roles.map((r) => (
          <Badge key={r} variant={r === "filmmaker" ? "gold" : "outline"}>
            {r}
          </Badge>
        ))}
      </span>
    </Link>
  );
}
