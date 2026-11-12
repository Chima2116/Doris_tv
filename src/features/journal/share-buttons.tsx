"use client";

import { Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Share via copy link, WhatsApp or X (PRD §10.5). */
export function ShareButtons({ title, path }: { title: string; path: string }) {
  const url = () => `${window.location.origin}${path}`;
  const open = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 aria-hidden="true" /> Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={async () => {
            try {
              await navigator.clipboard.writeText(url());
              toast.success("Link copied");
            } catch {
              toast.error("Couldn't copy the link. Copy it from the address bar instead.");
            }
          }}
        >
          <Link2 aria-hidden="true" /> Copy link
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url()}`)}`)}
        >
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url())}`)
          }
        >
          X / Twitter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
