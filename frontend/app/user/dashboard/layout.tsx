import { CollapsibleSidebar } from "@/components/navigation/collapsible-sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Header } from "@/components/navigation/header";
import { RoleGuard } from "@/components/auth/role-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard expectedRole="Learner">
      <div className="flex h-screen overflow-hidden bg-muted/30">
        <CollapsibleSidebar role="learner" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            {children}
          </main>
          <MobileNav role="learner" />
        </div>
      </div>
    </RoleGuard>
  );
}
