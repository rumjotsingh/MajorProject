"use client";

import { Bell, Search, Moon, Sun, Globe, Command, CheckCircle, Award, Briefcase, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface UserData {
  name: string;
  email: string;
}

interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const [userData, setUserData] = useState<UserData>({ name: "User", email: "" });
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await api.get("/auth/me");
        setUserData({
          name: response.data.name || "User",
          email: response.data.email || "",
        });
      } catch (error) {
        // silent fail
      }
    };
    loadUserData();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get("/notifications");
      const notifications = response.data || [];
      setUnreadCount(notifications.filter((n: any) => !n.read).length);
      setRecentNotifications(notifications.slice(0, 5));
    } catch (error) {
      // silent fail
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "CredentialVerified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CredentialAdded":
        return <Award className="h-4 w-4 text-blue-500" />;
      case "JobMatch":
        return <Briefcase className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setRecentNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      // silent fail
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-2xl">
      <div className="flex h-14 items-center gap-4 px-6">
        {/* Search */}
        <div className="flex-1 flex items-center gap-3">
          <button className="flex items-center gap-3 h-9 w-full max-w-sm px-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted/70 hover:border-primary/20 text-muted-foreground text-sm transition-all duration-200 cursor-pointer focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10">
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left">Search credentials, skills...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded-md border border-border/60 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted/70">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs">Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>हिंदी</DropdownMenuItem>
              <DropdownMenuItem>ਪੰਜਾਬੀ</DropdownMenuItem>
              <DropdownMenuItem>தமிழ்</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-xl hover:bg-muted/70"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted/70">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <p className="text-sm font-semibold">Notifications</p>
                <Link href="/notifications" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">Loading...</div>
                ) : recentNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">No notifications</div>
                ) : (
                  recentNotifications.map((notification) => (
                    <button
                      key={notification._id}
                      onClick={() => !notification.read && markAsRead(notification._id)}
                      className={`w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors ${
                        notification.read ? "bg-background" : "bg-primary/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug ${
                            notification.read ? "font-normal" : "font-medium"
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-border/60 to-transparent mx-1" />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all duration-200">
                <Avatar className="h-8 w-8 ring-2 ring-border/60">
                  <AvatarImage src="" alt={userData.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-semibold">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{userData.name}</p>
                  <p className="text-xs text-muted-foreground">{userData.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}