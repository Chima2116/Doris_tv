import Image from "next/image";
import type { ImageAsset } from "@/data/images";
import { cn } from "@/lib/utils";

/**
 * The single image primitive. Real photographs go through here so ratios, focal points and credits
 * are handled in one place. With no image it renders a quiet, dark plate that states what is
 * missing (see docs/ASSET-REQUIREMENTS.md). It never invents a picture or a credit.
 */
export type PhotoProps = {
  asset?: ImageAsset;
  /** Used for the plate's accessible name when there is no asset. */
  alt?: string;
  ratio?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
};

export function Photo({ asset, alt = "Photograph", ratio = "3/2", fill = false, priority = false, sizes = "100vw", className, imgClassName }: PhotoProps) {
  const box = cn("relative overflow-hidden bg-[#161616]", fill && "absolute inset-0 h-full w-full", className);
  const style = fill ? undefined : { aspectRatio: ratio };

  if (asset) {
    return (
      <div className={box} style={style}>
        <Image
          src={asset.src}
          alt={asset.alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", imgClassName)}
          style={{ objectPosition: asset.focal }}
        />
      </div>
    );
  }
  return (
    <div role="img" aria-label={`${alt} (photograph to be supplied)`} className={box} style={style}>
      <span aria-hidden="true" className="absolute bottom-3 left-3 text-[0.6875rem] font-medium text-white/40">Photograph to be supplied</span>
    </div>
  );
}

/** Credit line. Shown only from recorded data; CC BY-SA requires attribution and a licence link. */
export function PhotoCredit({ asset, className, withCaption = true }: { asset: ImageAsset; className?: string; withCaption?: boolean }) {
  const { author, license, sourceUrl, via = "Wikimedia Commons" } = asset.credit;
  return (
    <p className={cn("text-[0.6875rem] leading-snug", className)}>
      {withCaption && <span>{asset.caption} </span>}
      <span>
        Photo:{" "}
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">
          {author}
        </a>
        , {license}, via {via}.
      </span>
    </p>
  );
}
