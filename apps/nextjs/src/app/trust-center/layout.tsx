import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust Center | Descope",
  description:
    "Learn about Descope's security practices, compliance certifications, and commitment to protecting your data.",
  openGraph: {
    title: "Trust Center | Descope",
    description:
      "Learn about Descope's security practices, compliance certifications, and commitment to protecting your data.",
  },
};

/**
 * Layout for the Trust Center section.
 * Provides metadata and wraps all trust-center pages.
 */
export default function TrustCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
