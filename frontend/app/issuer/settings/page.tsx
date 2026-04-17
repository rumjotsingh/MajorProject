"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, Lock, User, Globe, Moon, Sun, Key, Shield, 
  Mail, Smartphone, AlertTriangle, Save, Eye, EyeOff,
  Settings as SettingsIcon, Palette, Clock, Languages
} from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface NotificationSettings {
  emailNotifications: boolean;
  verificationRequests: boolean;
  credentialIssued: boolean;
  weeklySummary: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
}

interface IssuerProfile {
  name: string;
  contactEmail: string;
  allowedDomains: string[];
}

export default function IssuerSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [profile, setProfile] = useState<IssuerProfile>({
    name: "",
    contactEmail: "",
    allowedDomains: []
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    verificationRequests: true,
    credentialIssued: true,
    weeklySummary: false,
    securityAlerts: true,
    systemUpdates: false
  });
  
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h"
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load profile data
      const profileResponse = await api.get("/issuer/profile");
      setProfile({
        name: profileResponse.data.name,
        contactEmail: profileResponse.data.contactEmail,
        allowedDomains: profileResponse.data.allowedDomains || []
      });
      
      // In a real app, you'd load notification and security settings from the backend
      // For now, we'll use the default values
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAccountSettings = async () => {
    try {
      setSaving(true);
      await api.put("/issuer/profile", {
        name: profile.name,
        contactEmail: profile.contactEmail,
        allowedDomains: profile.allowedDomains
      });
      
      toast({
        title: "Success",
        description: "Account settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update account settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setSaving(true);
      // In a real app, you'd save to backend
      // await api.put("/issuer/settings/notifications", notifications);
      
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Settings */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Account Information</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your organization name"
              />
            </div>
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.contactEmail}
                onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="domains">Allowed Domains</Label>
            <Input
              id="domains"
              value={profile.allowedDomains.join(", ")}
              onChange={(e) => setProfile({ 
                ...profile, 
                allowedDomains: e.target.value.split(",").map(d => d.trim()).filter(d => d) 
              })}
              placeholder="example.com, university.edu"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separated list of domains authorized to issue credentials
            </p>
          </div>
          
          <Button onClick={saveAccountSettings} disabled={saving} className="w-fit">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Account Settings"}
          </Button>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Appearance</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, emailNotifications: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Verification Requests</Label>
              <p className="text-sm text-muted-foreground">Get notified about new verification requests</p>
            </div>
            <Switch
              checked={notifications.verificationRequests}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, verificationRequests: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Credential Issued</Label>
              <p className="text-sm text-muted-foreground">Notifications when credentials are issued</p>
            </div>
            <Switch
              checked={notifications.credentialIssued}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, credentialIssued: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">Important security notifications</p>
            </div>
            <Switch
              checked={notifications.securityAlerts}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, securityAlerts: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Summary</Label>
              <p className="text-sm text-muted-foreground">Get a weekly summary of your activity</p>
            </div>
            <Switch
              checked={notifications.weeklySummary}
              onCheckedChange={(checked) => 
                setNotifications({ ...notifications, weeklySummary: checked })
              }
            />
          </div>
          
          <Button onClick={saveNotificationSettings} disabled={saving} className="w-fit">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Notification Settings"}
          </Button>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Security</h3>
        </div>
        
        <div className="space-y-6">
          {/* Password Change */}
          <div className="space-y-4">
            <h4 className="font-medium">Change Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="max-w-md">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
            <Button 
              onClick={changePassword} 
              disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
              className="w-fit"
            >
              <Lock className="h-4 w-4 mr-2" />
              {saving ? "Changing..." : "Change Password"}
            </Button>
          </div>
          
          {/* Security Options */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h4 className="font-medium">Security Options</h4>
            <div className="flex items-center justify-between">
              <div>
                <Label>Login Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
              </div>
              <Switch
                checked={security.loginAlerts}
                onCheckedChange={(checked) => 
                  setSecurity({ ...security, loginAlerts: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
              </div>
              <Select
                value={security.sessionTimeout.toString()}
                onValueChange={(value) => 
                  setSecurity({ ...security, sessionTimeout: parseInt(value) })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="0">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Language & Region */}
      <div className="rounded-xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Language & Region</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={preferences.language} onValueChange={(value) => 
              setPreferences({ ...preferences, language: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="pa">Punjabi</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={preferences.timezone} onValueChange={(value) => 
              setPreferences({ ...preferences, timezone: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date-format">Date Format</Label>
            <Select value={preferences.dateFormat} onValueChange={(value) => 
              setPreferences({ ...preferences, dateFormat: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="time-format">Time Format</Label>
            <Select value={preferences.timeFormat} onValueChange={(value) => 
              setPreferences({ ...preferences, timeFormat: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12 Hour</SelectItem>
                <SelectItem value="24h">24 Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <h3 className="font-semibold text-red-800 dark:text-red-200">Danger Zone</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">Delete Account</p>
            <p className="text-sm text-red-700 dark:text-red-300">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}