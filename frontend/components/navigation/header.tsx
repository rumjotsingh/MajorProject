"use client";

import { Globe } from "lucide-react";
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
import { RoleBasedSearch } from "@/components/ui/role-based-search";

interface UserData { 
  name: string; 
  email: string; 
  role: "Learner" | "Employer" | "Issuer" | "Admin";
}

export function Header() {
  const [userData, setUserData] = useState<UserData>({ 
    name: "User", 
    email: "", 
    role: "Learner" 
  });

  useEffect(() => {
    api.get("/auth/me")
      .then(r => setUserData({ 
        name: r.data.name || "User", 
        email: r.data.email || "",
        role: r.data.role || "Learner"
      }))
      .catch(() => {});
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

  const getProfileLink = (role: string) => {
    switch (role) {
      case "Employer": return "/employer/profile";
      case "Issuer": return "/issuer/profile";
      case "Admin": return "/admin/profile";
      default: return "/profile";
    }
  };

  const getSettingsLink = (role: string) => {
    switch (role) {
      case "Employer": return "/employer/settings";
      case "Issuer": return "/issuer/settings";
      case "Admin": return "/admin/settings";
      default: return "/settings";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-whisper bg-white/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-4 px-6">
        {/* Role-Based Global Search */}
        <div className="flex-1">
          <RoleBasedSearch role={userData.role.toLowerCase() as "learner" | "employer" | "issuer" | "admin"} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-micro hover:bg-warm-white">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-caption">Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>हिंदी</DropdownMenuItem>
              <DropdownMenuItem>ਪੰਜਾਬੀ</DropdownMenuItem>
              <DropdownMenuItem>தமிழ்</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <NotificationPanel />

          <div className="h-6 w-px bg-border/60 mx-1" />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-notion-blue/20">
                <Avatar className="h-8 w-8 border-whisper">
                  <AvatarImage src="" alt={userData.name} />
                  <AvatarFallback className="bg-notion-blue text-white text-badge font-semibold">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 mt-1">
              <DropdownMenuLabel className="font-normal">
                <p className="text-body-semibold">{userData.name}</p>
                <p className="text-caption text-warm-gray-500">{userData.email}</p>
                <p className="text-caption text-notion-blue font-medium">{userData.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={getProfileLink(userData.role)}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={getSettingsLink(userData.role)}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-orange focus:text-orange"
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
