import { CollapsibleSidebar } from "@/components/navigation/collapsible-sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
