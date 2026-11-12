"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/features/auth/session-provider";
import { initials } from "@/lib/utils";
import { canAccessAdmin, isAdmin, isVerifiedFilmmaker } from "@/lib/permissions";

/** Session-aware header actions: guest CTAs or the member menu. */
export function UserMenu() {
  const { user, switchIdentity } = useSession();

  if (!user) {
    return (
      <div className="flex items-center gap-5 pl-2 text-sm">
        <Link href="/sign-in" className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline">
          Sign in
        </Link>
        <Link href="/waitlist" className="hidden underline decoration-gold decoration-[1.5px] underline-offset-[6px] transition-colors hover:text-gold sm:inline">
          Join the waitlist
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2 pl-1 pr-2 transition-colors hover:bg-white/5"
          aria-label={`Account menu for ${user.displayName}`}
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-elevated text-xs font-bold">
              {initials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block text-sm font-semibold">{user.displayName}</span>
          <span className="block text-xs font-normal text-muted-foreground">@{user.username}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/profile/${user.username}`}>Your profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/saved">Saved articles</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/following">Following</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        {isVerifiedFilmmaker(user) ? (
          <DropdownMenuItem asChild>
            <Link href="/filmmaker-dashboard/profile">Manage filmmaker profile</Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/filmmaker-application">Filmmaker application</Link>
          </DropdownMenuItem>
        )}
        {canAccessAdmin(user) && (
          <DropdownMenuItem asChild>
            <Link href={isAdmin(user) ? "/admin" : "/admin/moderation"}>
              {isAdmin(user) ? "Admin" : "Moderation"}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => switchIdentity("guest")}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
