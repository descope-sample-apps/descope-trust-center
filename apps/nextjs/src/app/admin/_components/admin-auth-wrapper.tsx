import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";

export default async function AdminAuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.token?.sub) {
    redirect("/auth/signin");
  }

  const email =
    typeof session.token.email === "string" ? session.token.email : undefined;
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
