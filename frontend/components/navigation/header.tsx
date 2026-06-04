"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { NotificationPanel } from "@/components/ui/notification-panel";
import { RoleBasedSearch } from "@/components/ui/role-based-search";
import { LogOut, Settings, User } from "lucide-react";

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/auth/me")
      .then(r => setUserData({ 
        name: r.data.name || "User", 
        email: r.data.email || "",
        role: r.data.role || "Learner"
      }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
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
      <div className="flex h-12 items-center gap-3 px-4">
        {/* Role-Based Global Search */}
        <div className="flex-1">
          <RoleBasedSearch role={userData.role.toLowerCase() as "learner" | "employer" | "issuer" | "admin"} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Language */}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-comfortable hover:bg-warm-white">
            <Globe className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <NotificationPanel />

          <div className="h-6 w-px bg-border/60 mx-1" />

          {/* Profile */}
          <div ref={profileMenuRef} className="relative">
            <Button
              variant="ghost"
              className="h-8 w-8 rounded-full p-0"
              onClick={() => setShowProfileMenu((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={showProfileMenu}
            >
              <Avatar className="h-8 w-8 border-whisper">
                <AvatarImage src="" alt={userData.name} />
                <AvatarFallback className="bg-muted text-foreground text-[12px] font-semibold">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
            </Button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full z-[100] mt-2 w-52 rounded-comfortable border border-whisper bg-white p-1 text-near-black shadow-notion-card">
                <div className="px-2 py-1.5">
                  <p className="text-[14px] font-semibold leading-5">{userData.name}</p>
                  <p className="text-[12px] text-warm-gray-500 leading-4">{userData.email}</p>
                  <p className="text-[12px] text-warm-gray-500 leading-4">{userData.role}</p>
                </div>
                <div className="my-1 h-px bg-warm-gray-300/30" />
                <Link
                  href={getProfileLink(userData.role)}
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 rounded-comfortable px-2 py-1.5 text-[14px] leading-5 outline-none transition-colors hover:bg-warm-white"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                {userData.role !== "Admin" &&
                <Link
                  href={getSettingsLink(userData.role)}
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 rounded-comfortable px-2 py-1.5 text-[14px] leading-5 outline-none transition-colors hover:bg-warm-white"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>}
                <div className="my-1 h-px bg-warm-gray-300/30" />
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-comfortable px-2 py-1.5 text-left text-[14px] leading-5 text-orange outline-none transition-colors hover:bg-orange/5"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/login";
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
