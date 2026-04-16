"use client";

import { Moon, Sun, Globe } from "lucide-react";
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
import { NotificationPanel } from "@/components/ui/notification-panel";
import { GlobalSearch } from "@/components/ui/global-search";

interface UserData { name: string; email: string; }

export function Header() {
  const { theme, setTheme } = useTheme();
  const [userData, setUserData] = useState<UserData>({ name: "User", email: "" });

  useEffect(() => {
    api.get("/auth/me")
      .then(r => setUserData({ name: r.data.name || "User", email: r.data.email || "" }))
      .catch(() => {});
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-2xl">
      <div className="flex h-14 items-center gap-4 px-6">
        {/* Global Search */}
        <div className="flex-1">
          <GlobalSearch />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
             
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

          {/* Theme */}
          <Button variant="ghost" size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-xl hover:bg-muted/70"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications */}
          <NotificationPanel />

          <div className="h-6 w-px bg-border/60 mx-1" />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/20">
                <Avatar className="h-8 w-8 ring-2 ring-border/60">
                  <AvatarImage src="" alt={userData.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-semibold">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 mt-1">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold">{userData.name}</p>
                <p className="text-xs text-muted-foreground">{userData.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive"
                onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
