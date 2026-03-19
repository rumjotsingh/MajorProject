"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar,
  Award,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import api from "@/lib/api";
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
}

export default function VerificationsPage() {
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState<"verified" | "failed">("verified");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/issuer/pending-verifications");
      console.log("Pending verifications response:", response.data);
      
      // Backend returns paginated format: {credentials: [], pagination: {}}
      const credentialsData = response.data?.credentials || [];
      
      console.log("Processed credentials:", credentialsData);
      setCredentials(Array.isArray(credentialsData) ? credentialsData : []);
    } catch (error: any) {
      console.error("Failed to load pending verifications:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load pending verifications",
        variant: "destructive",
      });
      setCredentials([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

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
        description: `Credential ${verificationAction === "verified" ? "verified" : "rejected"}`,
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

  if (loading) {
    return <VerificationsSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Verifications</h1>
          <p className="text-muted-foreground">
            Review and verify credentials uploaded by learners
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {Array.isArray(credentials) ? credentials.length : 0} Pending
        </Badge>
      </div>

      {!Array.isArray(credentials) || credentials.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-sm text-muted-foreground">
                No pending verifications at the moment
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {credentials.map((cred, i) => (
            <motion.div
              key={cred._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(cred.userId.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{cred.title}</h3>
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                          <span className="font-medium">{cred.userId.name}</span>
                          <span>•</span>
                          <span>{cred.userId.email}</span>
                          <span>•</span>
                          <span>NSQF {cred.nsqfLevel}</span>
                        </div>
                      </div>

                      {cred.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cred.skills.map((skill, j) => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Issued: {formatDate(cred.issueDate)}</span>
                        <span>•</span>
                        <span>Uploaded: {formatDate(cred.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(cred.certificateUrl, "_blank")}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openVerificationDialog(cred, "verified")}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openVerificationDialog(cred, "failed")}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Verification Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verificationAction === "verified" ? "Verify Credential" : "Reject Credential"}
            </DialogTitle>
            <DialogDescription>
              {verificationAction === "verified"
                ? "Confirm that this credential is authentic and valid."
                : "Provide a reason for rejecting this credential."}
            </DialogDescription>
          </DialogHeader>

          {selectedCredential && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-semibold">{selectedCredential.title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCredential.userId.name} • {selectedCredential.userId.email}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {verificationAction === "verified" ? "Notes (Optional)" : "Rejection Reason"}
                </label>
                <Textarea
                  placeholder={
                    verificationAction === "verified"
                      ? "Add any notes about this verification..."
                      : "Explain why this credential is being rejected..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {verificationAction === "failed" && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    The learner will be notified about the rejection and your reason.
                  </p>
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
              disabled={verifying}
              variant={verificationAction === "verified" ? "default" : "destructive"}
            >
              {verifying ? "Processing..." : verificationAction === "verified" ? "Verify" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VerificationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
