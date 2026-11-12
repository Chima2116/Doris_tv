import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * DORIS TV button: sharp corners, uppercase tracked labels.
 * default = gold (primary action, used sparingly), outline = white hairline.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,border-color,opacity] duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/85",
        gold: "bg-primary text-primary-foreground hover:bg-primary/85",
        outline:
          "border border-white/25 bg-transparent text-foreground hover:border-white hover:bg-white/5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-white/15",
        ghost: "text-foreground hover:bg-white/10",
        destructive: "bg-danger text-primary-foreground hover:bg-danger/85",
        link: "px-0! normal-case tracking-normal text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 text-[0.9375rem]",
        sm: "h-9 px-4 text-sm",
        xs: "h-7 px-3 text-xs",
        lg: "h-12 px-8 text-[0.9375rem]",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
