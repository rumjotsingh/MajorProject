import { CollapsibleSidebar } from "@/components/navigation/collapsible-sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <CollapsibleSidebar role="employer" />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6 md:py-8">
          {children}
        </div>
      </main>
      <MobileNav role="employer" />
    </div>
  );
}
