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

  return (
    <>
      {/* Main Bottom Navigation */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 left-0 right-0 z-50 md:hidden flex justify-center"
      >
        <div className="glass glass-border rounded-full px-4 py-2.5 shadow-2xl backdrop-blur-xl border-2 max-w-fit">
          <div className="flex items-center justify-center gap-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-full transition-all duration-200",
                      item.isMain
                        ? "bg-primary text-primary-foreground w-14 h-14 shadow-lg shadow-primary/50 -mt-6"
                        : "w-12 h-12",
                      isActive && !item.isMain && "bg-primary/10"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "transition-all",
                        item.isMain ? "h-6 w-6" : "h-5 w-5",
                        isActive && !item.isMain ? "text-primary" : item.isMain ? "" : "text-muted-foreground"
                      )} 
                    />
                    
                    {/* Active indicator */}
                    {isActive && !item.isMain && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Label tooltip */}
                    <AnimatePresence>
                      {isActive && !item.isMain && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute -top-8 text-xs font-medium whitespace-nowrap px-2 py-1 rounded-md bg-background/95 backdrop-blur-sm border shadow-lg"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
            
            {/* Menu Button */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setShowMenu(!showMenu)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                showMenu ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Extended Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-28 left-4 right-4 z-50 md:hidden"
            >
              <div className="glass glass-border rounded-2xl p-4 shadow-2xl backdrop-blur-xl border-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Menu</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMenu(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isNotifications = item.label === "Notifications";
                    
                    if (item.isAction) {
                      return (
                        <motion.button
                          key={item.label}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                            "hover:bg-destructive/10 text-destructive"
                          )}
                          onClick={() => {
                            localStorage.clear();
                            window.location.href = "/";
                          }}
                        >
                          <Icon className="h-5 w-5" />
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
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent relative"
                        >
                          <div className="relative">
                            <Icon className="h-5 w-5" />
                            {isNotifications && unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </span>
                            )}
                          </div>
                          <span className="font-medium">{item.label}</span>
                          {isNotifications && unreadCount > 0 && (
                            <span className="ml-auto h-5 px-2 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
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
