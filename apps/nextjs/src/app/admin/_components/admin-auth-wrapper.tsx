import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";

export default async function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.token.sub) {
    redirect("/auth/signin");
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const claims = session?.token?.claims as { email?: string } | undefined;
  const email = claims?.email;
  const isAdmin = email?.endsWith("@descope.com");
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
