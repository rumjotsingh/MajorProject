"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, Mail, Shield, Edit, Save, X, Calendar, Settings, 
  Key, Database, Users, Activity 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
}

interface AdminStats {
  totalUsers: number;
  totalCredentials: number;
  totalIssuers: number;
  totalEmployers: number;
}

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/me");
      const profileData = response.data;
      setProfile({
        _id: profileData.userId || profileData._id,
        name: profileData.name || "",
        email: profileData.email || "",
        role: profileData.role || "Admin",
        createdAt: profileData.createdAt || new Date().toISOString(),
        lastLogin: profileData.lastLogin,
        permissions: profileData.permissions || ["all"],
      });
      
      // Prefill form data
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
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

  const loadStats = async () => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load admin stats:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put("/admin/profile", {
        name: formData.name,
        email: formData.email,
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
    <div className="space-y-6 pb-8 max-w-4xl mx-auto pt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your administrator account and system overview
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
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{profile.email}</span>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Administrator
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Details */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Full Name</label>
            {editing ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Email Address</label>
            {editing ? (
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {profile.permissions.map((permission, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-muted text-sm font-medium flex items-center gap-1">
                  <Key className="h-3 w-3" />
                  {permission === "all" ? "Full Access" : permission}
                </span>
              ))}
            </div>
          </div>

          {profile.lastLogin && (
            <div>
              <label className="text-sm font-medium mb-2 block">Last Login</label>
              <p className="text-sm text-muted-foreground">
                {new Date(profile.lastLogin).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* System Overview */}
      {stats && (
        <div className="rounded-xl border  bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">System Overview</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalCredentials}</p>
              <p className="text-sm text-muted-foreground">Credentials</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <Settings className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalIssuers}</p>
              <p className="text-sm text-muted-foreground">Issuers</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <Activity className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalEmployers}</p>
              <p className="text-sm text-muted-foreground">Employers</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Administrator Access</h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              You have full administrative privileges. Use these permissions responsibly and ensure 
              your account remains secure. Consider enabling two-factor authentication for enhanced security.
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}