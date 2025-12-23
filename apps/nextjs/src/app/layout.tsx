import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { cn } from "@descope-trust-center/ui";
import { ThemeProvider, ThemeToggle } from "@descope-trust-center/ui/theme";
import { Toaster } from "@descope-trust-center/ui/toast";

import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://trust.descope.com"
      : "http://localhost:3000",
  ),
  title: "Descope Trust Center",
  description: "Security, compliance, and privacy information for Descope",
  openGraph: {
    title: "Descope Trust Center",
    description: "Security, compliance, and privacy information for Descope",
    url: "https://trust.descope.com",
    siteName: "Descope Trust Center",
  },
  twitter: {
    card: "summary_large_image",
    site: "@descope",
    creator: "@descope",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ThemeProvider>
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
          <div className="absolute right-4 bottom-4">
            <ThemeToggle />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
