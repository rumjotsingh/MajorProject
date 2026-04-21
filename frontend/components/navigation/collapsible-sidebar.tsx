"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award, ChevronLeft, ChevronRight, FileCheck, Home, LogOut,
  Map, Sparkles, Upload, User, Briefcase, CheckSquare,
  Search, Bookmark, Users, Crown, Mail, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface NavItem  { label: string; href: string; icon: React.ComponentType<{ className?: string }>; }
interface NavSection { title: string; items: NavItem[]; }
interface UserData  { name: string; email: string; role: string; }
interface CollapsibleSidebarProps { role?: "learner" | "employer" | "issuer" | "admin"; }

const learnerSections: NavSection[] = [
  { title: "Main",        items: [{ label: "Dashboard",          href: "/user/dashboard",          icon: Home }] },
  { title: "Credentials", items: [
    { label: "Upload",       href: "/user/credentials/upload", icon: Upload },
    { label: "My Credentials", href: "/user/credentials",       icon: Award },
  ]},
  { title: "Career", items: [
    { label: "Career Studio",       href: "/user/career-path",      icon: Map },
    { label: "Job Recommendations", href: "/user/jobs/recommended", icon: Sparkles },
    { label: "Applied Jobs",        href: "/user/jobs/applied",     icon: FileCheck },
  ]},
];

const issuerSections: NavSection[] = [
  { title: "Main",        items: [{ label: "Dashboard",   href: "/issuer/dashboard",    icon: Home }] },
  { title: "Work",        items: [
    { label: "Issue",        href: "/issuer/issue",        icon: Upload },
    { label: "Learners",     href: "/issuer/learners",     icon: Users },
    { label: "Verifications",href: "/issuer/verifications",icon: CheckSquare },
  ]},
  { title: "Account",     items: [
    { label: "Profile",  href: "/issuer/profile",  icon: User },
  ]},
];

const employerSections: NavSection[] = [
  { title: "Main",    items: [{ label: "Dashboard",     href: "/employer/dashboard", icon: Home }] },
  { title: "Hiring",  items: [
    { label: "Search Talent", href: "/employer/search",    icon: Search },
    { label: "Jobs",          href: "/employer/jobs",      icon: Briefcase },
    { label: "Applications",  href: "/employer/applications", icon: FileCheck },
    { label: "Bookmarks",     href: "/employer/bookmarks", icon: Bookmark },
  ]},
  { title: "Account", items: [{ label: "Profile", href: "/employer/profile", icon: User }] },
];

const adminSections: NavSection[] = [
  { title: "Main",       items: [{ label: "Dashboard", href: "/admin/dashboard", icon: Home }] },
  { title: "Management", items: [
    { label: "Users",         href: "/admin/users",         icon: User },
    { label: "Issuers",       href: "/admin/issuers",       icon: CheckSquare },
    { label: "Employers",     href: "/admin/employers",     icon: Briefcase },
    { label: "Credentials",   href: "/admin/credentials",   icon: Award },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: Crown },
    { label: "Blog",          href: "/admin/blog",          icon: FileCheck },
    { label: "Contacts",      href: "/admin/contacts",      icon: Mail },
    { label: "NSQF",          href: "/admin/nsqf",          icon: Layers },
  ]},
];

export function CollapsibleSidebar({ role = "learner" }: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<UserData>({ name: "User", email: "", role: "Learner" });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    api.get("/auth/me")
      .then(r => setUserData({ 
        name: r.data.name || "User", 
        email: r.data.email || "",
        role: r.data.role || "Learner"
      }))
      .catch(() => {});
  }, []);

  // Load collapsed state from localStorage on mount (client-side only)
  useEffect(() => {
    if (!mounted) return;
    
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      setCollapsed(JSON.parse(savedCollapsed));
    } else {
      // Auto-collapse on smaller screens initially
      setCollapsed(window.innerWidth < 1200);
    }
  }, [mounted]);

  // Save collapsed state to localStorage when it changes (client-side only)
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed, mounted]);

  // Handle window resize (but don't auto-collapse if user manually expanded)
  useEffect(() => {
    if (!mounted) return;
    
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

  const sections = useMemo(() => {
    if (role === "issuer")   return issuerSections;
    if (role === "employer") return employerSections;
    if (role === "admin")    return adminSections;
    return learnerSections;
  }, [role]);

  const isActive = (href: string) => {
    // Exact match
    if (pathname === href) return true;
    
    // Special case for credentials base route - only exact match
    if (href === "/credentials" || href === "/user/credentials") {
      return pathname === href;
    }
    
    // For child routes, only mark parent as active if no exact match exists
    // This prevents both "Upload" and "My Credentials" from being active
    return false;
  };

  const initials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

  const getProfileLink = () => {
    switch (role) {
      case "issuer": return "/issuer/profile";
      case "employer": return "/employer/profile";
      case "admin": return "/admin/profile";
      default: return "/profile";
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside
      style={{ width: collapsed ? 64 : 240 }}
      className="relative hidden h-full shrink-0 flex-col bg-background transition-[width] duration-200 ease-in-out md:flex"
    >
      {/* Logo */}
      <div className={cn("flex h-14 items-center px-4", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Award className="h-4 w-4" />
          </span>
          {!collapsed && <span className="text-sm font-semibold tracking-tight truncate">CredMatrix</span>}
        </Link>
        {!collapsed && (
          <button 
            onClick={toggleCollapsed}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button 
          onClick={toggleCollapsed}
          className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                      collapsed && "justify-center px-2",
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom user row */}
      <div className={cn(
        "px-3 py-3 flex items-center gap-2.5",
        collapsed && "justify-center"
      )}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
          {initials(userData.name)}
        </div>
        {!collapsed && (
          <>
            <Link className="flex-1 min-w-0" href={getProfileLink()}>
              <p className="text-xs font-medium truncate">{userData.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{userData.email}</p>
            </Link>
            <button
              onClick={() => { localStorage.clear(); window.location.href = "/"; }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
