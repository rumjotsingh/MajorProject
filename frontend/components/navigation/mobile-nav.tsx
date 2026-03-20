"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, Award, Plus, Map, User, Menu, X, Settings, Bell, LogOut, Users, Upload, CheckSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const learnerNavItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Award, label: "Credentials", href: "/credentials" },
  { icon: Plus, label: "Add", href: "/credentials/upload", isMain: true },
  { icon: Map, label: "Skills", href: "/skill-map" },
  { icon: User, label: "Profile", href: "/profile" },
];

const issuerNavItems = [
  { icon: Home, label: "Home", href: "/issuer/dashboard" },
  { icon: CheckSquare, label: "Verify", href: "/issuer/verifications" },
  { icon: Plus, label: "Issue", href: "/issuer/issue", isMain: true },
  { icon: Users, label: "Learners", href: "/issuer/learners" },
  { icon: User, label: "Profile", href: "/issuer/profile" },
];

const employerNavItems = [
  { icon: Home, label: "Home", href: "/employer/dashboard", isMain: true },
];

const adminNavItems = [
  { icon: Home, label: "Home", href: "/admin/dashboard", isMain: true },
];

const learnerMenuItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: LogOut, label: "Logout", href: "/", isAction: true },
];

const issuerMenuItems = [
  { icon: Settings, label: "Settings", href: "/issuer/settings" },
  { icon: Bell, label: "Notifications", href: "/issuer/notifications" },
  { icon: LogOut, label: "Logout", href: "/", isAction: true },
];

const employerMenuItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: LogOut, label: "Logout", href: "/", isAction: true },
];

const adminMenuItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: LogOut, label: "Logout", href: "/", isAction: true },
];

interface MobileNavProps {
  role?: "learner" | "employer" | "issuer" | "admin";
}

export function MobileNav({ role = "learner" }: MobileNavProps) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = role === "issuer" ? issuerNavItems : role === "employer" ? employerNavItems : role === "admin" ? adminNavItems : learnerNavItems;
  const menuItems = role === "issuer" ? issuerMenuItems : role === "employer" ? employerMenuItems : role === "admin" ? adminMenuItems : learnerMenuItems;

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

  return (
    <>
      {/* ═══ Floating Bottom Dock ═══ */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        {/* Gradient fade at bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
        
        <div className="relative flex justify-center pb-4 px-4">
          <div className="bg-background/90 backdrop-blur-2xl rounded-2xl px-2 py-2 shadow-xl shadow-black/[0.08] dark:shadow-black/[0.3] border border-border/60 max-w-fit">
            <div className="flex items-center justify-center gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                if (item.isMain) {
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="mx-1"
                      >
                        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center shadow-lg shadow-primary/30 -mt-3">
                          <Icon className="h-5 w-5" />
                        </div>
                      </motion.div>
                    </Link>
                  );
                }

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "relative flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200",
                        isActive && "bg-primary/10"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] mt-0.5 font-medium transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </span>

                      {/* Active dot */}
                      {isActive && (
                        <motion.div
                          layoutId="mobileDock"
                          className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}

              {/* Menu toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                  "relative flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200",
                  showMenu ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
              >
                <Menu className="h-5 w-5" />
                <span className="text-[10px] mt-0.5 font-medium">More</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ═══ Extended Menu Sheet ═══ */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            >
              <div className="bg-background rounded-t-3xl border-t shadow-2xl p-5 pb-8">
                {/* Handle bar */}
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-5" />

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Menu</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMenu(false)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isNotifications = item.label === "Notifications";

                    if (item.isAction) {
                      return (
                        <motion.button
                          key={item.label}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center gap-3 p-3.5 rounded-xl text-destructive hover:bg-destructive/5 transition-colors"
                          onClick={() => {
                            localStorage.clear();
                            window.location.href = "/";
                          }}
                        >
                          <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </motion.button>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowMenu(false)}
                      >
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted/60 transition-colors"
                        >
                          <div className="relative h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                            {isNotifications && unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </span>
                            )}
                          </div>
                          <span className="font-medium flex-1">{item.label}</span>
                          {isNotifications && unreadCount > 0 && (
                            <span className="h-6 px-2.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Safe area spacer */}
      <div className="h-24 md:hidden" />
    </>
  );
}
