"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle, Award, Briefcase, AlertCircle, Check, Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Notification {
  _id: string;
  type: "CredentialVerified" | "CredentialAdded" | "JobMatch" | "EmployerContact" | "System";
  message: string;
  read: boolean;
  metadata?: {
    credentialId?: string;
    jobId?: string;
    applicationId?: string;
    learnerId?: string;
  };
  createdAt: string;
}

// Map notification type + metadata → redirect URL
const getRedirectUrl = (n: Notification): string => {
  switch (n.type) {
    case "CredentialVerified":
    case "CredentialAdded":
      if (n.metadata?.credentialId) return `/credentials`;
      return "/credentials";
    case "JobMatch":
      if (n.metadata?.jobId) return `/jobs/recommended`;
      return "/jobs/recommended";
    case "EmployerContact":
      return "/notifications";
    default:
      return "/notifications";
  }
};

const getIcon = (type: string) => {
  switch (type) {
    case "CredentialVerified": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "CredentialAdded":    return <Award className="h-4 w-4 text-blue-500" />;
    case "JobMatch":           return <Briefcase className="h-4 w-4 text-purple-500" />;
    case "EmployerContact":    return <Bell className="h-4 w-4 text-orange-500" />;
    default:                   return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

const getIconBg = (type: string) => {
  switch (type) {
    case "CredentialVerified": return "bg-green-100 dark:bg-green-900/30";
    case "CredentialAdded":    return "bg-blue-100 dark:bg-blue-900/30";
    case "JobMatch":           return "bg-purple-100 dark:bg-purple-900/30";
    case "EmployerContact":    return "bg-orange-100 dark:bg-orange-900/30";
    default:                   return "bg-muted";
  }
};

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

export function NotificationPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load when opened
  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    // Mark as read first
    if (!n.read) {
      try {
        await api.put(`/notifications/${n._id}/read`);
        setNotifications((prev) =>
          prev.map((item) => item._id === n._id ? { ...item, read: true } : item)
        );
      } catch {}
    }
    // Close panel and navigate
    setOpen(false);
    router.push(getRedirectUrl(n));
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
          open
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel — right-aligned */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-11 z-50 w-[380px] rounded-2xl border border-border/60 bg-background shadow-2xl shadow-black/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/70 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-2.5 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <Bell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No notifications yet</p>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {notifications.slice(0, 15).map((n) => (
                    <motion.button
                      key={n._id}
                      layout
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "w-full text-left flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all duration-150",
                        n.read
                          ? "hover:bg-muted/50"
                          : "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        getIconBg(n.type)
                      )}>
                        {getIcon(n.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <p className={cn("text-sm leading-snug", !n.read && "font-medium")}>
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTime(n.createdAt)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!n.read && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 px-4 py-2.5 flex items-center justify-between">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:underline font-medium"
              >
                View all notifications
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-3 w-3" />
                Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
