"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Search, ChevronLeft, ChevronRight, Award, Building2,
  Calendar, Eye, Download, CheckCircle, Clock, XCircle, Trash2, Edit, X,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

interface Credential {
  _id: string;
  title: string;
  issuerId: { _id: string; name: string };
  issueDate: string;
  verificationStatus: "verified" | "pending" | "rejected";
  nsqfLevel: number;
  skills: string[];
  certificateUrl: string;
  credits?: number;
  createdAt: string;
}

const statusStyle = (s: string) => {
  if (s === "verified") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (s === "rejected") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
};

const StatusIcon = ({ s }: { s: string }) => {
  if (s === "verified") return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (s === "rejected") return <XCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-amber-500" />;
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function CredentialsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state
  const [viewCred, setViewCred] = useState<Credential | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter !== "all") params.append("status", statusFilter);
      const { data } = await api.get(`/credentials?${params}`);
      if (data.credentials) {
        setCredentials(data.credentials);
        setTotalPages(data.pagination?.pages || 1);
        setTotal(data.pagination?.total || data.credentials.length);
      } else if (Array.isArray(data)) {
        setCredentials(data);
        setTotal(data.length);
        setTotalPages(1);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.error || "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/credentials/${deleteId}`);
      toast({ title: "Deleted", description: "Credential removed." });
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.error || "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="space-y-5 pb-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">My Credentials</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{total} credential{total !== 1 ? "s" : ""} in your portfolio</p>
        </div>
        <Link href="/credentials/upload">
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Add Credential</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search credentials..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-sm rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={limit.toString()} onValueChange={v => { setLimit(parseInt(v)); setPage(1); }}>
          <SelectTrigger className="w-24 h-9 text-sm rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50].map(n => <SelectItem key={n} value={n.toString()}>{n} / page</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[rgba(0,0,0,0.06)]">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : credentials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Award className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">
              {search || statusFilter !== "all" ? "No results found" : "No credentials yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {search || statusFilter !== "all" ? "Try adjusting your filters" : "Upload your first credential to get started"}
            </p>
            {!search && statusFilter === "all" && (
              <Link href="/credentials/upload"><Button size="sm" variant="outline">Upload Credential</Button></Link>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-[rgba(0,0,0,0.06)] bg-muted/30">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Credential</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28 text-center">Date</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20 text-center">Level</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20 text-center">Status</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24 text-right">Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[rgba(0,0,0,0.06)]">
              {credentials.map(cred => (
                <div key={cred._id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors">
                  {/* Title + issuer */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{cred.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Building2 className="h-3 w-3 shrink-0" />{cred.issuerId.name}
                      </p>
                    </div>
                  </div>
                  {/* Date */}
                  <div className="w-28 text-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                      <Calendar className="h-3 w-3" />{new Date(cred.issueDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {/* Level */}
                  <div className="w-20 text-center">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      L{cred.nsqfLevel}
                    </span>
                  </div>
                  {/* Status */}
                  <div className="w-20 text-center">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle(cred.verificationStatus)}`}>
                      {cred.verificationStatus.charAt(0).toUpperCase() + cred.verificationStatus.slice(1)}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="w-24 flex items-center justify-end gap-1">
                    <button onClick={() => setViewCred(cred)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                      title="View">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {cred.verificationStatus !== "verified" && (
                      <button onClick={() => router.push(`/credentials/edit/${cred._id}`)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => setDeleteId(cred._id)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[rgba(0,0,0,0.06)] bg-muted/10">
              <p className="text-xs text-muted-foreground">Showing {start}–{end} of {total}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="h-7 w-7 flex items-center justify-center rounded-lg border border-[rgba(0,0,0,0.1)] text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return (
                    <button key={n} onClick={() => setPage(n)}
                      className={`h-7 w-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                        page === n ? "bg-primary text-primary-foreground" : "border border-[rgba(0,0,0,0.1)] text-muted-foreground hover:bg-muted"
                      }`}>
                      {n}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="h-7 w-7 flex items-center justify-center rounded-lg border border-[rgba(0,0,0,0.1)] text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── View Modal ── */}
      <AnimatePresence>
        {viewCred && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setViewCred(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-lg rounded-2xl bg-background shadow-2xl overflow-hidden"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{viewCred.title}</p>
                      <p className="text-xs text-muted-foreground">{viewCred.issuerId.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewCred(null)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Status banner */}
                <div className={`mx-6 mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                  viewCred.verificationStatus === "verified"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : viewCred.verificationStatus === "rejected"
                    ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                }`}>
                  <StatusIcon s={viewCred.verificationStatus} />
                  {viewCred.verificationStatus === "verified" ? "Verified Credential"
                    : viewCred.verificationStatus === "rejected" ? "Verification Rejected"
                    : "Pending Verification"}
                </div>

                {/* Details */}
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Issue Date</p>
                      <p className="text-sm font-medium">{fmt(viewCred.issueDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">NSQF Level</p>
                      <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-muted">Level {viewCred.nsqfLevel}</span>
                    </div>
                    {viewCred.credits && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Credits</p>
                        <p className="text-sm font-medium">{viewCred.credits}</p>
                      </div>
                    )}
                  </div>

                  {viewCred.skills.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {viewCred.skills.map((s, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Credential ID</p>
                    <p className="text-xs font-mono text-muted-foreground break-all">{viewCred._id}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-6 pb-5">
                  {viewCred.certificateUrl && (
                    <a href={viewCred.certificateUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" className="w-full gap-2"><Download className="h-3.5 w-3.5" />View Certificate</Button>
                    </a>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setViewCred(null)} className="flex-1">Close</Button>
                </div>
              </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => !deleting && setDeleteId(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-sm rounded-2xl border border-[rgba(0,0,0,0.1)] bg-background shadow-2xl p-6 space-y-4"
              >
                <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-semibold">Delete credential?</p>
                  <p className="text-sm text-muted-foreground mt-1">This action cannot be undone. The credential will be permanently removed from your portfolio.</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setDeleteId(null)} disabled={deleting} className="flex-1">Cancel</Button>
                  <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting} className="flex-1">
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
