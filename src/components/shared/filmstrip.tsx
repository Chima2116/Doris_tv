import { cn } from "@/lib/utils";

/** Gold perforated strip: the film-inspired device from the concept. Decorative. */
export function Filmstrip({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("filmstrip", className)} />;
}
