import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

// DORIS TV typography (Brand Bible): Poppins throughout.
// Black 900 for display moments, Bold/SemiBold for headings, Regular/Medium for body and interface.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DORIS TV — Where Independent African Film Lives",
    template: "%s — DORIS TV",
  },
  openGraph: { siteName: "DORIS TV", type: "website" },
  description:
    "A digital editorial and community home for independent African cinema: the Journal, filmmaker profiles and a community of people who care about African film.",
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("dark h-full", poppins.variable)}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
