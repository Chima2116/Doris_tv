import { cn } from "@/lib/utils";

const widths = {
  narrow: "max-w-3xl", // reading column
  default: "max-w-[1200px]",
  wide: "max-w-[1400px]",
} as const;

export function PageContainer({
  children,
  className,
  width = "default",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  width?: keyof typeof widths;
  as?: "div" | "section" | "header" | "footer" | "article";
}) {
  return (
    <Tag className={cn("mx-auto w-full px-5 sm:px-6 lg:px-8", widths[width], className)}>
      {children}
    </Tag>
  );
}
