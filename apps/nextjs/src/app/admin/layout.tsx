import Link from "next/link";

import { getSession } from "~/auth/server";
import { mapDescopeSession } from "~/auth/session";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Certifications", href: "/admin/certifications", icon: "🏆" },
  { name: "Documents", href: "/admin/documents", icon: "📄" },
  { name: "Subprocessors", href: "/admin/subprocessors", icon: "🏢" },
  { name: "FAQs", href: "/admin/faqs", icon: "❓" },
  { name: "Audit Logs", href: "/admin/audit", icon: "📋" },
];

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = mapDescopeSession(await getSession());

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white shadow-sm">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-center border-b px-4">
            <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex-1">
                {session?.user ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {session.user.name ?? session.user.email}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Not authenticated</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
