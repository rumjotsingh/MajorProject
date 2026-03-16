import { Header } from "@/components/navigation/header";
import { CollapsibleSidebar } from "@/components/navigation/collapsible-sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <CollapsibleSidebar role="learner" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-28 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
