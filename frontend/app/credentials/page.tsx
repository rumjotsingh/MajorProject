"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, ChevronLeft, ChevronRight, Award, Building, Calendar, Eye, Download, CheckCircle, Clock, XCircle, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

interface Credential {
  _id: string;
  title: string;
  issuerId: {
    _id: string;
    name: string;
  };
  issueDate: string;
  verificationStatus: "verified" | "pending" | "rejected";
  nsqfLevel: number;
  skills: string[];
  certificateUrl: string;
  createdAt: string;
}

export default function CredentialsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadCredentials();
  }, [page, limit, debouncedSearch, statusFilter]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      if (statusFilter && statusFilter !== "all") {
        params.append('status', statusFilter);
      }

      const response = await api.get(`/credentials?${params.toString()}`);
      
      console.log("Credentials API Response:", response.data);
      
      // Handle both paginated and non-paginated responses
      if (response.data && response.data.credentials && Array.isArray(response.data.credentials)) {
        console.log("Setting paginated credentials:", response.data.credentials.length);
        setCredentials(response.data.credentials);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotal(response.data.pagination?.total || response.data.credentials.length);
      } else if (Array.isArray(response.data)) {
        console.log("Setting array credentials:", response.data.length);
        setCredentials(response.data);
        setTotal(response.data.length);
        setTotalPages(1);
      } else {
        // Fallback to empty array
        console.error("Unexpected response format:", response.data);
        setCredentials([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error("Failed to load credentials:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load credentials",
        variant: "destructive",
      });
      // Set empty array on error
      setCredentials([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Page reset is handled in the debounce useEffect
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewCredential = (credential: Credential) => {
    setSelectedCredential(credential);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (credentialId: string) => {
    setCredentialToDelete(credentialId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!credentialToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/credentials/${credentialToDelete}`);
      
      toast({
        title: "Success",
        description: "Credential deleted successfully",
      });

      // Reload credentials
      await loadCredentials();
      setDeleteDialogOpen(false);
      setCredentialToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete credential",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (credentialId: string) => {
    router.push(`/credentials/edit/${credentialId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Credentials</h1>
          <p className="text-muted-foreground">
            Manage and view all your credentials
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Total Credentials: <span className="font-semibold">{total}</span>
          </p>
        </div>
        <Link href="/credentials/upload">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Credential</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </Link>
      </div>

      {/* Coming Soon Banner */}
     

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Top Row - Entries and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select value={limit.toString()} onValueChange={(value) => {
                  setLimit(parseInt(value));
                  setPage(1);
                }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Entries</span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search credentials..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Bottom Row - Filters */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={(value: string) => {
                  setStatusFilter(value);
                  setPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {!Array.isArray(credentials) || credentials.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== "all" ? "No credentials found" : "No credentials yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start building your portfolio by uploading your first credential"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link href="/credentials/upload">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Upload Credential
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credential</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>NSQF Level</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(credentials) && credentials.map((credential) => (
                      <TableRow key={credential._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-medium">{credential.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{credential.issuerId.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(credential.issueDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {credential.nsqfLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {credential.skills.slice(0, 2).map((skill, j) => (
                              <Badge key={j} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {credential.skills.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{credential.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(credential.verificationStatus)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleViewCredential(credential)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            {credential.verificationStatus !== 'verified' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-2"
                                onClick={() => handleEditClick(credential._id)}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(credential._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startEntry} to {endEntry} of {total} entries
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {totalPages > 0 && [...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      } else if (pageNum === page - 2 || pageNum === page + 2) {
                        return <span key={pageNum} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Credential Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Credential Details
            </DialogTitle>
            <DialogDescription>
              View complete information about this credential
            </DialogDescription>
          </DialogHeader>

          {selectedCredential && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border ${
                selectedCredential.verificationStatus === 'verified' 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                  : selectedCredential.verificationStatus === 'pending'
                  ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
                  : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedCredential.verificationStatus)}
                  <span className="font-semibold">
                    {selectedCredential.verificationStatus === 'verified' && 'Verified Credential'}
                    {selectedCredential.verificationStatus === 'pending' && 'Pending Verification'}
                    {selectedCredential.verificationStatus === 'rejected' && 'Verification Rejected'}
                  </span>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-lg font-semibold mt-1">{selectedCredential.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Issuer</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedCredential.issuerId.name}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Issue Date</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{formatDate(selectedCredential.issueDate)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">NSQF Level</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">
                      Level {selectedCredential.nsqfLevel}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Skills</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCredential.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Credential ID</label>
                  <p className="text-sm font-mono mt-1 text-muted-foreground">{selectedCredential._id}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedCredential.certificateUrl && (
                  <a 
                    href={selectedCredential.certificateUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      View Certificate
                    </Button>
                  </a>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setViewDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the credential from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
