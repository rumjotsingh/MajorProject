"use client";

import { CollapsibleSidebar } from "@/components/navigation/collapsible-sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { useEffect, useState } from "react";
import { authService } from "@/lib/auth";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<"learner" | "issuer" | "employer" | "admin">("learner");

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.role) {
      setRole(user.role.toLowerCase() as "learner" | "issuer" | "employer" | "admin");
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <CollapsibleSidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav role={role} />
      </div>
    </div>
  );
}
