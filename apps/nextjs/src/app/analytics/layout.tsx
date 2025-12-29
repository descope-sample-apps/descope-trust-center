import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";

const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;

  if (email.endsWith("@descope.com")) return true;

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) ?? [];
  return adminEmails.includes(email);
};

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !isAdmin(session.user?.email)) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track document downloads, form submissions, and access requests
        </p>
      </div>
      {children}
    </div>
  );
}
