import { CollapsibleSidebar } from "@/components/navigation/collapsible-sidebar";
import { Header } from "@/components/navigation/header";
import { MobileNav } from "@/components/navigation/mobile-nav";

export default function IssuerNotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <CollapsibleSidebar role="issuer" />
      <main className="flex-1 overflow-y-auto">
        <Header/>
        <div className="container py-6 md:py-8">
          {children}
        </div>
      </main>
      <MobileNav role="issuer" />
    </div>
  );
}
