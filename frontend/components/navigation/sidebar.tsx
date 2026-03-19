"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Award,
  Upload,
  Map,
  Briefcase,
  Building2,
  Settings,
  Bell,
  BarChart3,
  Shield,
  Users,
} from "lucide-react";

const learnerNav = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Award, label: "Credentials", href: "/credentials" },
  { icon: Upload, label: "Upload", href: "/credentials/upload" },
  { icon: Map, label: "Skill Map", href: "/skill-map" },
  { icon: Briefcase, label: "Career Path", href: "/career" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const employerNav = [
  { icon: Home, label: "Dashboard", href: "/employer/dashboard" },
  { icon: Users, label: "Search Learners", href: "/employer/search" },
  { icon: Award, label: "Verify Credentials", href: "/employer/verify" },
  { icon: BarChart3, label: "Analytics", href: "/employer/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const issuerNav = [
  { icon: Home, label: "Dashboard", href: "/issuer/dashboard" },
  { icon: Award, label: "Issue Credentials", href: "/issuer/issue" },
  { icon: Users, label: "Learners", href: "/issuer/learners" },
  { icon: BarChart3, label: "Analytics", href: "/issuer/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const adminNav = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Award, label: "Credentials", href: "/admin/credentials" },
  { icon: Building2, label: "Issuers", href: "/admin/issuers" },
  { icon: Shield, label: "Verification Logs", href: "/admin/logs" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface SidebarProps {
  role?: "learner" | "employer" | "issuer" | "admin";
}

export function Sidebar({ role = "learner" }: SidebarProps) {
  const pathname = usePathname();

  const navItems =
    role === "employer"
      ? employerNav
      : role === "issuer"
      ? issuerNav
      : role === "admin"
      ? adminNav
      : learnerNav;

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Award className="h-6 w-6 text-primary" />
          <span className="text-lg">CredMatrix</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
