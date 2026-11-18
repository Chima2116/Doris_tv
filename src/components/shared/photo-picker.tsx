"use client";

import { useId, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 3 * 1024 * 1024;

/**
 * Profile photo: choose an image, see a preview, replace or remove it. The picture is read in the
 * browser and kept as a preview until the Studio and sign-in are connected, when it is uploaded.
 */
export function PhotoPicker({
  value,
  onChange,
  label,
  hint,
  shape = "portrait",
  initials,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  label: string;
  hint?: string;
  shape?: "portrait" | "round";
  initials?: string;
}) {
  const id = useId();
  const [error, setError] = useState<string | null>(null);

  const read = (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Use a JPG, PNG or WebP image.");
    if (file.size > MAX_BYTES) return setError("Keep the image under 3 MB.");
    setError(null);
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  const frame = shape === "round" ? "size-28 rounded-full" : "aspect-[4/5] w-40";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className={cn("relative grid shrink-0 place-items-center overflow-hidden border border-border bg-elevated", frame)}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- a user-chosen preview, not a site asset
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-display text-3xl font-black text-white/70" aria-hidden="true">{initials ?? <ImagePlus className="size-7" />}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-reading" id={`${id}-label`}>{label}</p>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label htmlFor={id} className="cursor-pointer text-sm font-semibold text-gold underline underline-offset-4">
            {value ? "Replace photo" : "Upload photo"}
          </label>
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-labelledby={`${id}-label`}
            className="sr-only"
            onChange={(e) => {
              read(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              <X aria-hidden="true" /> Remove
            </Button>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      </div>
    </div>
  );
}
