import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { cn } from "@descope-trust-center/ui";
import { ThemeProvider, ThemeToggle } from "@descope-trust-center/ui/theme";
import { Toaster } from "@descope-trust-center/ui/toast";

import { Footer } from "~/app/_components/footer";
import { Header } from "~/app/_components/header";
import { AuthProvider } from "~/auth/client";
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://trust.descope.com/#organization",
      name: "Descope",
      url: "https://descope.com",
      logo: {
        "@type": "ImageObject",
        url: "https://trust.descope.com/descope-logo.svg",
      },
      sameAs: [
        "https://twitter.com/descope",
        "https://linkedin.com/company/descope",
        "https://github.com/descope",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://trust.descope.com/#website",
      url: "https://trust.descope.com",
      name: "Descope Trust Center",
      publisher: { "@id": "https://trust.descope.com/#organization" },
      description:
        "Security, compliance, and privacy information for Descope. View our certifications, security practices, and compliance documentation.",
    },
    {
      "@type": "WebPage",
      "@id": "https://trust.descope.com/#webpage",
      url: "https://trust.descope.com",
      name: "Descope Trust Center - Security & Compliance",
      isPartOf: { "@id": "https://trust.descope.com/#website" },
      about: { "@id": "https://trust.descope.com/#organization" },
      description:
        "Descope Trust Center provides transparency into our security posture, compliance certifications (SOC 2, ISO 27001, GDPR), and data protection practices.",
    },
  ],
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://trust.descope.com/en"
        />
        <link
          rel="alternate"
          hrefLang="de"
          href="https://trust.descope.com/de"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://trust.descope.com/es"
        />
        <link
          rel="alternate"
          hrefLang="fr"
          href="https://trust.descope.com/fr"
        />
        <link
          rel="alternate"
          hrefLang="ja"
          href="https://trust.descope.com/ja"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://trust.descope.com/en"
        />
      </head>
      <body
        className={cn(
          "bg-background text-foreground flex min-h-screen flex-col font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <AuthProvider projectId={env.NEXT_PUBLIC_DESCOPE_PROJECT_ID}>
            <ThemeProvider>
              <TRPCReactProvider>
                <Header />
                <div className="flex-1">{props.children}</div>
                <Footer />
              </TRPCReactProvider>
              <div className="fixed right-4 bottom-4 z-50">
                <ThemeToggle />
              </div>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
