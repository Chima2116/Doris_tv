import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignSystemDemo } from "./demo";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

/** Development-only reference for tokens and components. 404s in production. */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DesignSystemDemo />;
}
