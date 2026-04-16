"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Award,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Home,
  LogOut,
  Map,
  Settings,
  Sparkles,
  Upload,
  User,
  Briefcase,
  CheckSquare,
  Search,
  Bookmark,
  Users,
  Crown,
  Mail,
  Layers,
} from "lucide-react";

import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface UserData {
  name: string;
  email: string;
}

interface CollapsibleSidebarProps {
  role?: "learner" | "employer" | "issuer" | "admin";
}

const learnerSections: NavSection[] = [
  {
    title: "Main",
    items: [{ label: "Dashboard", href: "/dashboard", icon: Home }],
  },
  {
    title: "Credentials",
    items: [
      { label: "Upload Credentials", href: "/credentials/upload", icon: Upload },
      { label: "My Credentials", href: "/credentials", icon: Award },
      { label: "Skill Map", href: "/skill-map", icon: Map },
    ],
  },
  {
    title: "Career",
    items: [
      { label: "Career Path", href: "/career-path", icon: Briefcase },
      { label: "Job Recommendations", href: "/jobs/recommended", icon: Sparkles },
      { label: "Applied Jobs", href: "/jobs/applied", icon: FileCheck },
    ],
  },
];

const issuerSections: NavSection[] = [
  {
    title: "Main",
    items: [{ label: "Dashboard", href: "/issuer/dashboard", icon: Home }],
  },
  {
    title: "Credentials",
    items: [
      { label: "Issue Credentials", href: "/issuer/issue", icon: Upload },
      { label: "Learners", href: "/issuer/learners", icon: Users },
      { label: "Verifications", href: "/issuer/verifications", icon: CheckSquare },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/issuer/profile", icon: User },
      { label: "Settings", href: "/issuer/settings", icon: Settings },
    ],
  },
];

const employerSections: NavSection[] = [
  {
    title: "Main",
    items: [{ label: "Dashboard", href: "/employer/dashboard", icon: Home }],
  },
  {
    title: "Hiring",
    items: [
      { label: "Search Talent", href: "/employer/search", icon: Search },
      { label: "Jobs", href: "/employer/jobs", icon: Briefcase },
      { label: "Bookmarks", href: "/employer/bookmarks", icon: Bookmark },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Profile", href: "/employer/profile", icon: User }],
  },
];

const adminSections: NavSection[] = [
  {
    title: "Main",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: Home }],
  },
  {
    title: "Management",
    items: [
      { label: "Users", href: "/admin/users", icon: User },
      { label: "Issuers", href: "/admin/issuers", icon: CheckSquare },
      { label: "Employers", href: "/admin/employers", icon: Briefcase },
      { label: "Credentials", href: "/admin/credentials", icon: Award },
      { label: "Subscriptions", href: "/admin/subscriptions", icon: Crown },
      { label: "Blog", href: "/admin/blog", icon: FileCheck },
      { label: "Contacts", href: "/admin/contacts", icon: Mail },
      { label: "NSQF", href: "/admin/nsqf", icon: Layers },
    ],
  },
];

export function CollapsibleSidebar({ role = "learner" }: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState<UserData>({ name: "User", email: "user@example.com" });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await api.get("/auth/me");
        setUserData({
          name: response.data.name || "User",
          email: response.data.email || "user@example.com",
        });
      } catch {
        // keep fallback user data
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sections = useMemo(() => {
    if (role === "issuer") return issuerSections;
    if (role === "employer") return employerSections;
    if (role === "admin") return adminSections;
    return learnerSections;
  }, [role]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  const isActivePath = (href: string) => {
    // Keep credential routes mutually exclusive:
    // /credentials should not be active while user is on /credentials/upload.
    if (href === "/credentials") {
      return pathname === "/credentials";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 88 : 292 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="relative hidden h-full shrink-0 flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl p-4 md:flex"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.01] pointer-events-none rounded-r-xl" />
      
      <div className="relative mb-4 flex items-center justify-between px-1">
        <Link href="/" className={cn("flex items-center gap-3", isCollapsed && "justify-center")}> 
          <span className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2 text-primary-foreground shadow-md shadow-primary/25">
            <Award className="h-4 w-4" />
          </span>
          {!isCollapsed && <span className="text-lg font-semibold tracking-tight">CredMatrix</span>}
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="relative mb-4 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-sm p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-muted/70 transition-all duration-200",
                isCollapsed && "justify-center px-0"
              )}
            >
              <Avatar className="h-9 w-9 border-2 border-primary/20 ring-2 ring-primary/10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-semibold">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{userData.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{userData.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align={isCollapsed ? "center" : "start"} className="w-52">
            <DropdownMenuItem asChild>
              <Link href={role === "issuer" ? "/issuer/profile" : role === "employer" ? "/employer/profile" : "/profile"}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={role === "issuer" ? "/issuer/settings" : "/settings"}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-4 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <nav className="relative flex-1 space-y-4 overflow-y-auto pr-1">
        {sections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isCollapsed && "justify-center px-2",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          </div>
        ))}
      </nav>

      <div className="relative pt-3">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
