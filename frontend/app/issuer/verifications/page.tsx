"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, CheckCircle, XCircle, Eye, Calendar, Award, AlertTriangle,
  Search, ChevronLeft, ChevronRight, Filter, MoreHorizontal, User,
  Building2, Mail, FileText, Download, ExternalLink, MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Credential {
  _id: string;
  title: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  skills: string[];
  nsqfLevel: number;
  issueDate: string;
  certificateUrl: string;
  verificationStatus: "pending";
  createdAt: string;
  credits?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type SortBy = "createdAt" | "issueDate" | "title" | "nsqfLevel";
type SortOrder = "asc" | "desc";

export default function VerificationsPage() {
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Filters and search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [limit, setLimit] = useState(10);
  
  // Modal state
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState<"verified" | "failed">("verified");
  const [notes, setNotes] = useState("");
  
  const { toast } = useToast();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPagination(prev => ({ ...prev, page: 1 })); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadPendingVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
      
      if (debouncedSearch) params.append("search", debouncedSearch);
      
      const response = await api.get(`/issuer/pending-verifications?${params}`);
      const data = response.data;
      
      setCredentials(Array.isArray(data.credentials) ? data.credentials : []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (error: any) {
      console.error("Failed to load pending verifications:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load pending verifications",
        variant: "destructive",
      });
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, limit, sortBy, sortOrder, debouncedSearch, toast]);

  useEffect(() => {
    loadPendingVerifications();
  }, [loadPendingVerifications]);

  const handleVerify = async () => {
    if (!selectedCredential) return;

    try {
      setVerifying(true);
      await api.put(`/issuer/verify/${selectedCredential._id}`, {
        status: verificationAction,
        notes: notes.trim() || undefined,
      });

      toast({
        title: "Success",
        description: `Credential ${verificationAction === "verified" ? "verified" : "rejected"} successfully`,
      });

      setShowDialog(false);
      setSelectedCredential(null);
      setNotes("");
      loadPendingVerifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const openVerificationDialog = (credential: Credential, action: "verified" | "failed") => {
    setSelectedCredential(credential);
    setVerificationAction(action);
    setNotes("");
    setShowDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const start = (pagination.page - 1) * limit + 1;
  const end = Math.min(pagination.page * limit, pagination.total);

  if (loading) {
    return <VerificationsSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pending Verifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and verify credentials uploaded by learners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {pagination.total} pending
          </span>
          <div className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium">
            <Clock className="h-3 w-3 inline mr-1" />
            {pagination.total}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search credentials..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-9 rounded-xl"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
          <SelectTrigger className="w-40 h-9 rounded-xl">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Upload Date</SelectItem>
            <SelectItem value="issueDate">Issue Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="nsqfLevel">NSQF Level</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
          <SelectTrigger className="w-32 h-9 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest</SelectItem>
            <SelectItem value="asc">Oldest</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={limit.toString()} onValueChange={v => { setLimit(parseInt(v)); setPagination(prev => ({ ...prev, page: 1 })); }}>
          <SelectTrigger className="w-32 h-9 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50].map(n => <SelectItem key={n} value={n.toString()}>{n} / page</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Credentials List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {credentials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-medium text-sm">
              {search || debouncedSearch ? "No matching verifications" : "All caught up!"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || debouncedSearch 
                ? "Try adjusting your search terms" 
                : "No pending verifications at the moment"
              }
            </p>
          </div>
        ) : (
          <>
            {/* Credentials */}
            <div className="divide-y divide-border/40">
              {credentials.map((credential, index) => (
                <motion.div
                  key={credential._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                >
                  {/* User Avatar */}
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>

                  {/* Credential Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{credential.title}</h3>
                      <div className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Pending
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {credential.userId.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {credential.userId.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Level {credential.nsqfLevel}
                      </span>
                    </div>
                    
                    {credential.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {credential.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {credential.skills.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                            +{credential.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Issued {formatDate(credential.issueDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Uploaded {formatDate(credential.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(credential.certificateUrl, "_blank")}
                      className="h-8 gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openVerificationDialog(credential, "verified")}
                      className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openVerificationDialog(credential, "failed")}
                      className="h-8 gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/10">
              <p className="text-sm text-muted-foreground">
                Showing {start}–{end} of {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1 || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  const n = pagination.pages <= 5 ? i + 1 : 
                    pagination.page <= 3 ? i + 1 : 
                    pagination.page >= pagination.pages - 2 ? pagination.pages - 4 + i : 
                    pagination.page - 2 + i;
                  return (
                    <Button
                      key={n}
                      size="sm"
                      variant={pagination.page === n ? "default" : "outline"}
                      onClick={() => setPagination(prev => ({ ...prev, page: n }))}
                      className="h-8 w-8 p-0 text-xs"
                    >
                      {n}
                    </Button>
                  );
                })}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages || loading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Verification Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verificationAction === "verified" ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {verificationAction === "verified" ? "Verify Credential" : "Reject Credential"}
            </DialogTitle>
            <DialogDescription>
              {verificationAction === "verified"
                ? "Confirm that this credential is authentic and meets your standards."
                : "Provide a clear reason for rejecting this credential."}
            </DialogDescription>
          </DialogHeader>

          {selectedCredential && (
            <div className="space-y-4">
              {/* Credential Summary */}
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{selectedCredential.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{selectedCredential.userId.name}</span>
                      <span>•</span>
                      <span>{selectedCredential.userId.email}</span>
                      <span>•</span>
                      <span>Level {selectedCredential.nsqfLevel}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(selectedCredential.certificateUrl, "_blank")}
                    className="h-8 gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Button>
                </div>
                
                {selectedCredential.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedCredential.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-background text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {verificationAction === "verified" ? "Notes (Optional)" : "Rejection Reason"}
                  {verificationAction === "failed" && <span className="text-red-500">*</span>}
                </label>
                <Textarea
                  placeholder={
                    verificationAction === "verified"
                      ? "Add any notes about this verification..."
                      : "Please explain why this credential is being rejected..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Warning for rejection */}
              {verificationAction === "failed" && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      This action will notify the learner
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      The learner will receive an email notification with your rejection reason. 
                      Please provide clear and constructive feedback.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={verifying}>
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verifying || (verificationAction === "failed" && !notes.trim())}
              variant={verificationAction === "verified" ? "default" : "destructive"}
            >
              {verifying ? "Processing..." : verificationAction === "verified" ? "Verify Credential" : "Reject Credential"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VerificationsSkeleton() {
  return (
    <div className="space-y-6 pb-8 max-w-7xl">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="divide-y divide-border/40">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}