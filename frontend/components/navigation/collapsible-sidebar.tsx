"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Award,
  Upload,
  Map,
  Briefcase,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Sparkles,
  FileCheck,
  CheckSquare,
  Crown,
  Mail,
  Layers,
  Search,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const learnerNav = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Award, label: "Credentials", href: "/credentials" },
  { icon: Upload, label: "Upload", href: "/credentials/upload" },
  { icon: Map, label: "Skill Map", href: "/skill-map" },
  { icon: Briefcase, label: "Career Path", href: "/career-path" },
  { icon: Sparkles, label: "Jobs", href: "/jobs/recommended" },
  { icon: FileCheck, label: "Applied", href: "/jobs/applied" },
];

const issuerNav = [
  { icon: Home, label: "Dashboard", href: "/issuer/dashboard" },
  { icon: CheckSquare, label: "Verifications", href: "/issuer/verifications" },
  { icon: User, label: "Profile", href: "/issuer/profile" },
  { icon: Award, label: "Learners", href: "/issuer/learners" },
  { icon: Upload, label: "Issue", href: "/issuer/issue" },
];

const employerNav = [
  { icon: Home, label: "Dashboard", href: "/employer/dashboard" },
  { icon: Search, label: "Search Talent", href: "/employer/search" },
  { icon: Briefcase, label: "Jobs", href: "/employer/jobs" },
  { icon: Bookmark, label: "Bookmarks", href: "/employer/bookmarks" },
  { icon: User, label: "Profile", href: "/employer/profile" },
];

const adminNav = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
  { icon: User, label: "Users", href: "/admin/users" },
  { icon: CheckSquare, label: "Issuers", href: "/admin/issuers" },
  { icon: Briefcase, label: "Employers", href: "/admin/employers" },
  { icon: Award, label: "Credentials", href: "/admin/credentials" },
  { icon: Crown, label: "Subscriptions", href: "/admin/subscriptions" },
  { icon: FileCheck, label: "Blog", href: "/admin/blog" },
  { icon: Mail, label: "Contacts", href: "/admin/contacts" },
  { icon: Layers, label: "NSQF", href: "/admin/nsqf" },
];

const bottomNavConfig = {
  learner: [
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
  issuer: [
    { icon: Bell, label: "Notifications", href: "/issuer/notifications" },
    { icon: Settings, label: "Settings", href: "/issuer/settings" },
  ],
  employer: [
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
  admin: [
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
};

interface CollapsibleSidebarProps {
  role?: "learner" | "employer" | "issuer" | "admin";
}

interface UserData {
  name: string;
  email: string;
}

export function CollapsibleSidebar({ role = "learner" }: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState<UserData>({ name: "User", email: "user@example.com" });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await api.get("/auth/me");
        setUserData({
          name: response.data.name || "User",
          email: response.data.email || "user@example.com",
        });
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await api.get("/notifications");
        const notifications = response.data || [];
        setUnreadCount(notifications.filter((n: any) => !n.read).length);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = role === "issuer" ? issuerNav : role === "employer" ? employerNav : role === "admin" ? adminNav : learnerNav;
  const bottomNav = bottomNavConfig[role] || bottomNavConfig.learner;

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col border-r bg-card/50 backdrop-blur-sm relative"
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold overflow-hidden">
          <div className="flex-shrink-0 p-1.5 rounded-lg bg-gradient-to-br from-primary to-purple-600">
            <Award className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-base whitespace-nowrap tracking-tight"
              >
                Cred<span className="text-primary">Matrix</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* User Profile Card */}
      <div className="p-3">
        <div
          className={cn(
            "flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer",
            isCollapsed && "justify-center"
          )}
        >
          <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-primary/10">
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-semibold">
              {getInitials(userData.name)}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-sm font-semibold truncate">{userData.name}</p>
                <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Divider */}
      <div className="px-4">
        <div className="h-px bg-border/60" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-4">
        <div className="h-px bg-border/60" />
      </div>

      {/* Bottom Navigation */}
      <div className="space-y-0.5 px-3 py-3">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isNotifications = item.label === "Notifications";

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <div className="relative">
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isNotifications && unreadCount > 0 && !isCollapsed && (
                  <span className="ml-auto h-5 px-2 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "text-muted-foreground hover:bg-destructive/5 hover:text-destructive",
            isCollapsed && "justify-center px-2"
          )}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3.5 top-20 h-7 w-7 rounded-full border bg-background shadow-md hover:shadow-lg transition-all z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </Button>
    </motion.aside>
  );
}
