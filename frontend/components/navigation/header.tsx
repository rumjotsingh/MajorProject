"use client";

import { Bell, Search, Moon, Sun, Globe, Command } from "lucide-react";
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

export function Header() {
  const { theme, setTheme } = useTheme();
  const [userData, setUserData] = useState<UserData>({ name: "User", email: "" });
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await api.get("/notifications");
        const notifications = response.data || [];
        setUnreadCount(notifications.filter((n: any) => !n.read).length);
      } catch (error) {
        // silent fail
      }
    };
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-2xl">
      <div className="flex h-14 items-center gap-4 px-6">
        {/* Search */}
        <div className="flex-1 flex items-center gap-3">
          <button className="flex items-center gap-3 h-9 w-full max-w-sm px-3 rounded-xl bg-muted/50 border border-transparent hover:border-border text-muted-foreground text-sm transition-all duration-200 cursor-pointer">
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left">Search credentials, skills...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded-md border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
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
            className="h-9 w-9 rounded-xl"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
              )}
            </Button>
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-border mx-1" />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                  <AvatarImage src="" alt={userData.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-semibold">
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
