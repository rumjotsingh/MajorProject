"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, Award, Briefcase, FileText, ArrowRight, X, Loader2, Users, Building2, UserCheck, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "credential" | "job" | "blog" | "page" | "learner" | "user" | "issuer" | "employer" | "verification";
  title: string;
  subtitle?: string;
  href: string;
}

interface RoleBasedSearchProps {
  role: "learner" | "employer" | "issuer" | "admin";
}

// Role-specific quick links
const QUICK_LINKS = {
  learner: [
    { id: "q1", type: "page", title: "Upload Credential", subtitle: "Add a new credential", href: "/credentials/upload" },
    { id: "q2", type: "page", title: "My Credentials", subtitle: "View all credentials", href: "/credentials" },
    { id: "q3", type: "page", title: "Career Studio", subtitle: "Skills & career paths", href: "/career-path" },
    { id: "q4", type: "page", title: "Job Recommendations", subtitle: "Find matching jobs", href: "/jobs/recommended" },
  ],
  employer: [
    { id: "e1", type: "page", title: "Search Talent", subtitle: "Find skilled learners", href: "/employer/search" },
    { id: "e2", type: "page", title: "Post Job", subtitle: "Create new job listing", href: "/employer/jobs/create" },
    { id: "e3", type: "page", title: "Applications", subtitle: "Manage applications", href: "/employer/applications" },
    { id: "e4", type: "page", title: "Bookmarks", subtitle: "Saved candidates", href: "/employer/bookmarks" },
  ],
  issuer: [
    { id: "i1", type: "page", title: "Issue Credential", subtitle: "Create new credential", href: "/issuer/issue" },
    { id: "i2", type: "page", title: "Verifications", subtitle: "Manage verifications", href: "/issuer/verifications" },
    { id: "i3", type: "page", title: "Learners", subtitle: "View learner profiles", href: "/issuer/learners" },
    { id: "i4", type: "page", title: "Settings", subtitle: "Account settings", href: "/issuer/settings" },
  ],
  admin: [
    { id: "a1", type: "page", title: "Users", subtitle: "Manage all users", href: "/admin/users" },
    { id: "a2", type: "page", title: "Issuers", subtitle: "Manage issuers", href: "/admin/issuers" },
    { id: "a3", type: "page", title: "Employers", subtitle: "Manage employers", href: "/admin/employers" },
    { id: "a4", type: "page", title: "Credentials", subtitle: "Manage credentials", href: "/admin/credentials" },
  ],
} as const;

// Role-specific placeholders
const PLACEHOLDERS = {
  learner: "Search credentials, skills, jobs...",
  employer: "Search talent, jobs, applications...",
  issuer: "Search learners, verifications...",
  admin: "Search users, issuers, employers...",
} as const;

const getIcon = (type: SearchResult["type"]) => {
  switch (type) {
    case "credential": return <Award className="h-4 w-4 text-blue-500" />;
    case "job":        return <Briefcase className="h-4 w-4 text-purple-500" />;
    case "blog":       return <FileText className="h-4 w-4 text-green-500" />;
    case "learner":    return <Users className="h-4 w-4 text-indigo-500" />;
    case "user":       return <UserCheck className="h-4 w-4 text-cyan-500" />;
    case "issuer":     return <Building2 className="h-4 w-4 text-orange-500" />;
    case "employer":   return <Building2 className="h-4 w-4 text-red-500" />;
    case "verification": return <Target className="h-4 w-4 text-emerald-500" />;
    default:           return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
  }
};

const getIconBg = (type: SearchResult["type"]) => {
  switch (type) {
    case "credential": return "bg-blue-100 dark:bg-blue-900/30";
    case "job":        return "bg-purple-100 dark:bg-purple-900/30";
    case "blog":       return "bg-green-100 dark:bg-green-900/30";
    case "learner":    return "bg-indigo-100 dark:bg-indigo-900/30";
    case "user":       return "bg-cyan-100 dark:bg-cyan-900/30";
    case "issuer":     return "bg-orange-100 dark:bg-orange-900/30";
    case "employer":   return "bg-red-100 dark:bg-red-900/30";
    case "verification": return "bg-emerald-100 dark:bg-emerald-900/30";
    default:           return "bg-muted";
  }
};

export function RoleBasedSearch({ role }: RoleBasedSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setActiveIndex(0);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const endpoint = `/search/${role}`;
      const response = await api.get(`${endpoint}?q=${encodeURIComponent(q)}&limit=8`);
      setResults(response.data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const displayItems = query.trim() ? results : QUICK_LINKS[role];

  const handleSelect = (item: SearchResult) => {
    setOpen(false);
    router.push(item.href);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, displayItems.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && displayItems[activeIndex]) handleSelect(displayItems[activeIndex]);
  };

  return (
    <>
      {/* Trigger button in header */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 h-9 w-full max-w-sm px-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted/70 hover:border-primary/20 text-muted-foreground text-sm transition-all duration-200"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{PLACEHOLDERS[role]}</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded-md border border-border/60 bg-background px-1.5 font-mono text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            />

            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
              <motion.div
                ref={containerRef}
                initial={{ opacity: 0, scale: 0.96, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full max-w-lg rounded-2xl bg-background shadow-2xl border border-border/60 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {loading
                    ? <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                    : <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  }
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                    onKeyDown={handleKeyDown}
                    placeholder={PLACEHOLDERS[role]}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <kbd className="hidden sm:flex h-5 items-center rounded bg-muted/50 px-1.5 text-[10px] font-mono text-muted-foreground">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[360px] overflow-y-auto p-2">
                  {!query.trim() && (
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Quick Links
                    </p>
                  )}
                  {query.trim() && results.length === 0 && !loading && (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  )}

                  {displayItems.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        activeIndex === i ? "bg-muted" : "hover:bg-muted/60"
                      )}
                    >
                      <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", getIconBg(item.type))}>
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {item.subtitle && <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>}
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Footer hint */}
                <div className="px-4 py-2 flex items-center gap-3 text-[11px] text-muted-foreground bg-muted/20">
                  <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                  <span><kbd className="font-mono">↵</kbd> select</span>
                  <span><kbd className="font-mono">ESC</kbd> close</span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}