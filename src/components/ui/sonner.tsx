"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Dark-only toaster styled with DORIS tokens (no theme switching). */
const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="dark"
    position="bottom-center"
    className="toaster group"
    style={
      {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "0px",
      } as React.CSSProperties
    }
    {...props}
  />
);

export { Toaster };
