import { RoleGuard } from "@/components/auth/role-guard";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard expectedRole="Admin">{children}</RoleGuard>
  );
}
