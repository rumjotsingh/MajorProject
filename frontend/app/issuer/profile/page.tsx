"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, Mail, Key, Edit, Save, X, Copy, CheckCircle, 
  Calendar, Globe, Shield 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface IssuerProfile {
  _id: string;
  name: string;
  contactEmail: string;
  apiKey: string;
  status: string;
  allowedDomains: string[];
  createdAt: string;
}

export default function IssuerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<IssuerProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    allowedDomains: "",
  });
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/issuer/profile");
      const profileData = response.data;
      setProfile(profileData);
      
      // Prefill form data
      setFormData({
        name: profileData.name || "",
        contactEmail: profileData.contactEmail || "",
        allowedDomains: Array.isArray(profileData.allowedDomains) 
          ? profileData.allowedDomains.join(", ") 
          : "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const domains = formData.allowedDomains
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      await api.put("/issuer/profile", {
        name: formData.name,
        contactEmail: formData.contactEmail,
        allowedDomains: domains,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditing(false);
      loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyApiKey = () => {
    if (profile?.apiKey) {
      navigator.clipboard.writeText(profile.apiKey);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Issuer Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your organization information and settings
          </p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border  bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{profile.contactEmail}</span>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(profile.status))}>
                  <Shield className="h-3 w-3 inline mr-1" />
                  {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Details */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Organization Name</label>
            {editing ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Organization name"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Contact Email</label>
            {editing ? (
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@example.com"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{profile.contactEmail}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Allowed Domains</label>
            {editing ? (
              <>
                <Input
                  value={formData.allowedDomains}
                  onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value })}
                  placeholder="example.com, university.edu"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated list of domains authorized to issue credentials
                </p>
              </>
            ) : profile.allowedDomains.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.allowedDomains.map((domain, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-muted text-sm font-medium flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {domain}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No domains configured</p>
            )}
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="rounded-xl border  bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">API Integration</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Use this API key to integrate with external systems and issue credentials programmatically.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">API Key</label>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                value={profile.apiKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={copyApiKey} variant="outline" size="icon">
                {copied ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium mb-2">Example Usage:</p>
            <code className="text-xs text-muted-foreground block">
              curl -H "X-API-Key: {profile.apiKey.substring(0, 20)}..." \\<br />
              &nbsp;&nbsp;-H "Content-Type: application/json" \\<br />
              &nbsp;&nbsp;-d '{`{"title": "Certificate", "recipient": "user@example.com"}`}' \\<br />
              &nbsp;&nbsp;https://api.credmatrix.com/issuer/credentials
            </code>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Security Notice</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Keep your API key secure and never share it publicly. If you suspect it has been compromised, 
              contact support immediately to regenerate it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="rounded-xl border  bg-card p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>

      <div className="rounded-xl border  bg-card p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}