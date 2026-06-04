"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, getDashboardPathForRole, type User } from "@/lib/auth";

interface RoleGuardProps {
  expectedRole?: User["role"];
  children: React.ReactNode;
}

export function RoleGuard({ expectedRole, children }: RoleGuardProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();

    if (!authService.isAuthenticated() || !user) {
      router.replace("/login");
      return;
    }

    if (expectedRole && user.role !== expectedRole) {
      router.replace(getDashboardPathForRole(user.role));
      return;
    }

    setIsReady(true);
  }, [expectedRole, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}