"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
import { Award, LayoutDashboard, User, Settings, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService, getDashboardPathForRole } from "@/lib/auth";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export function LandingNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const dashboardMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loggedIn = authService.isAuthenticated();
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      setUser(authService.getCurrentUser());
    }
  }, []);
  //console.log("LandingNav - User:", user);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (dashboardMenuRef.current && !dashboardMenuRef.current.contains(event.target as Node)) {
        setShowDashboardMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getDashboardPath = () => getDashboardPathForRole(user?.role);
  //console.log("LandingNav - Dashboard Path:", getDashboardPath());

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white border-b border-whisper shadow-sm"
            : "bg-white border-b border-whisper"
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative p-1.5 rounded-standard bg-notion-blue text-white transition-transform duration-200 group-hover:scale-105">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-body-large font-bold text-near-black">
              CredMatrix
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-nav text-warm-gray-500 hover:text-near-black transition-colors rounded-micro hover:bg-warm-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {isLoggedIn && user ? (
              <div ref={dashboardMenuRef} className="relative flex items-center gap-2">
                <Button
                  size="sm"
                  className="gap-2 px-3"
                  onClick={() => setShowDashboardMenu((open) => !open)}
                  aria-expanded={showDashboardMenu}
                  aria-haspopup="menu"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>

                {showDashboardMenu && (
                  <div className="absolute right-0 top-full z-[100] mt-2 w-52 rounded-standard border border-whisper bg-white p-1 text-near-black shadow-notion-card">
                    <div className="px-2 py-1.5">
                      <p className="text-body-semibold">{user.name}</p>
                      <p className="text-caption text-warm-gray-500">{user.role}</p>
                    </div>
                    <div className="my-1 h-px bg-warm-gray-300/30" />
                    <Link
                      href={getDashboardPath()}
                      onClick={() => setShowDashboardMenu(false)}
                      className="flex items-center gap-2 rounded-micro px-2 py-1.5 text-body outline-none transition-colors hover:bg-warm-white"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      My Dashboard
                    </Link>
                    <div className="my-1 h-px bg-warm-gray-300/30" />
                    <button
                      type="button"
                      onClick={() => authService.logout()}
                      className="flex w-full items-center gap-2 rounded-micro px-2 py-1.5 text-left text-body text-orange outline-none transition-colors hover:bg-orange/5"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-notion-blue/20 transition-all duration-200">
                      <Avatar className="h-9 w-9 border-whisper">
                        <AvatarImage src={user.avatar || ""} alt={user.name || "User"} />
                        <AvatarFallback className="bg-notion-blue text-white text-badge font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-body-semibold">{user.name}</p>
                        <p className="text-caption text-warm-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardPath()} className="gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => authService.logout()}
                      className="gap-2 cursor-pointer text-orange focus:text-orange"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-micro"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-16 left-0 right-0 z-50 md:hidden"
            >
              <div className="mx-4 mt-2 rounded-comfortable bg-white border border-whisper shadow-notion-deep p-4">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-body-medium rounded-standard hover:bg-warm-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-whisper mt-3 pt-3 flex flex-col gap-2">
                  {isLoggedIn && user ? (
                    <>
                      <Link href={getDashboardPath()} onClick={() => setMobileOpen(false)}>
                        <Button className="w-full gap-2" size="sm">
                          <LayoutDashboard className="h-4 w-4" />
                          Go to Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-orange border-orange/20 hover:bg-orange/5"
                        size="sm"
                        onClick={() => authService.logout()}
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full" size="sm">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full" size="sm">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
