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
  CheckSquare,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const learnerNav = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Award, label: "Credentials", href: "/credentials" },
  { icon: Upload, label: "Upload", href: "/credentials/upload" },
  { icon: Map, label: "Skill Map", href: "/skill-map" },
  { icon: Briefcase, label: "Career Path", href: "/career-path" },
  { icon: Sparkles, label: "Recommended Jobs", href: "/jobs/recommended" },
  { icon: FileCheck, label: "Applied Jobs", href: "/jobs/applied" },
  { icon: User, label: "Profile", href: "/profile" },
];

const issuerNav = [
  { icon: Home, label: "Dashboard", href: "/issuer/dashboard" },
  { icon: CheckSquare, label: "Verifications", href: "/issuer/verifications" },
  { icon: User, label: "Profile", href: "/issuer/profile" },
  { icon: Award, label: "Learners", href: "/issuer/learners" },
  { icon: Upload, label: "Issue Credential", href: "/issuer/issue" },
];

const employerNav = [
  { icon: Home, label: "Dashboard", href: "/employer/dashboard" },
];

const adminNav = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
];

const learnerBottomNav = [
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const issuerBottomNav = [
  { icon: Bell, label: "Notifications", href: "/issuer/notifications" },
  { icon: Settings, label: "Settings", href: "/issuer/settings" },
];

const employerBottomNav = [
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const adminBottomNav = [
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

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
        const unread = notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };
    loadUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = role === "issuer" ? issuerNav : role === "employer" ? employerNav : role === "admin" ? adminNav : learnerNav;
  const bottomNav = role === "issuer" ? issuerBottomNav : role === "employer" ? employerBottomNav : role === "admin" ? adminBottomNav : learnerBottomNav;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="hidden md:flex flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative"
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold overflow-hidden">
          <Award className="h-6 w-6 text-primary flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg whitespace-nowrap"
              >
                CredMatrix
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer",
          isCollapsed && "justify-center"
        )}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
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
                <p className="text-sm font-medium truncate">{userData.name}</p>
                <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Separator />

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
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

      <Separator />

      {/* Bottom Navigation */}
      <div className="space-y-1 p-4">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isNotifications = item.label === "Notifications";

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isNotifications && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
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
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            "text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center px-2"
          )}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
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

      {/* Collapse Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 h-8 w-8 rounded-full border bg-background shadow-md hover:shadow-lg transition-all z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </motion.aside>
  );
}
