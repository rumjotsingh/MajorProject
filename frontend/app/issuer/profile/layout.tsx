import { CollapsibleSidebar } from "@/components/navigation/collapsible-sidebar";
import { Header } from "@/components/navigation/header";
import { MobileNav } from "@/components/navigation/mobile-nav";

export default function IssuerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <CollapsibleSidebar role="issuer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header/>
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav role="issuer" />
      </div>
    </div>
  );
}
