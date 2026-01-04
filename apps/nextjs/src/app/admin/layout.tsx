import AdminAuthWrapper from "./_components/admin-auth-wrapper";
import AdminLayoutClient from "./admin-layout-client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminAuthWrapper>
  );
}
