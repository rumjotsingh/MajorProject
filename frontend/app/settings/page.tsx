"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Lock, User, Moon, Sun, CreditCard, Crown, AlertCircle, CheckCircle2, Sparkles, Clock } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { authService } from "@/lib/auth";
import { PricingModal } from "@/components/pricing-modal";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadUserData();
    // Only load subscription for learners
    if (user?.role === 'Learner') {
      loadSubscription();
    }
  }, [user?.role]);

  const loadUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      setFormData(prev => ({
        ...prev,
        name: response.data.name || "",
        email: response.data.email || "",
      }));
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const loadSubscription = async () => {
    // Only allow learners to access subscriptions
    if (user?.role !== 'Learner') {
      return;
    }
    
    try {
      const response = await api.get("/payment/subscription");
      setSubscription(response.data);
    } catch (error) {
      console.error("Failed to load subscription:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await api.put("/users/profile", {
        name: formData.name,
      });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      loadUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await api.put("/users/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features.")) {
      return;
    }

    try {
      setLoading(true);
      await api.post("/payment/cancel-subscription");
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled",
      });
      loadSubscription();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className={`grid w-full max-w-xl ${user?.role === 'Learner' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="account">Account</TabsTrigger>
          {user?.role === 'Learner' && <TabsTrigger value="subscription">Subscription</TabsTrigger>}
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div>
                  <Badge>{user?.role || "Learner"}</Badge>
                </div>
              </div>
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab - Only for Learners */}
        {user?.role === 'Learner' && (
          <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscription ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {subscription.subscription.plan === 'free' && <Sparkles className="h-6 w-6 text-primary" />}
                        {subscription.subscription.plan === 'pro' && <Crown className="h-6 w-6 text-primary" />}
                        {subscription.subscription.plan === 'enterprise' && <Crown className="h-6 w-6 text-primary" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold capitalize">{subscription.subscription.plan} Plan</h3>
                          <Badge variant={subscription.subscription.status === 'active' ? 'default' : 'secondary'}>
                            {subscription.subscription.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {subscription.subscription.plan === 'free' && 'Free forever with basic features'}
                          {subscription.subscription.plan === 'pro' && `₹999/month • Renews on ${formatDate(subscription.subscription.endDate)}`}
                          {subscription.subscription.plan === 'enterprise' && `₹4999/month • Renews on ${formatDate(subscription.subscription.endDate)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {subscription.subscription.plan === 'free' ? (
                        <Button onClick={() => setPricingModalOpen(true)}>
                          Upgrade Plan
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" onClick={() => setPricingModalOpen(true)}>
                            Change Plan
                          </Button>
                          <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading}>
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-4">Plan Features</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Credentials</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.usage.credentials} / {subscription.usage.maxCredentials === -1 ? '∞' : subscription.usage.maxCredentials} used
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        {subscription.subscription.features.aiRecommendations ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">AI Recommendations</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.subscription.features.aiRecommendations ? 'Enabled' : 'Not available'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        {subscription.subscription.features.analytics ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">Advanced Analytics</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.subscription.features.analytics ? 'Enabled' : 'Not available'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        {subscription.subscription.features.prioritySupport ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">Support</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.subscription.features.prioritySupport ? 'Priority' : 'Standard'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading subscription information...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Verifications Tab */}
        
      </Tabs>

      {user?.role === 'Learner' && (
        <PricingModal
          open={pricingModalOpen}
          onOpenChange={setPricingModalOpen}
          currentPlan={subscription?.subscription?.plan || 'free'}
          onSubscriptionComplete={() => {
            setPricingModalOpen(false);
            loadSubscription();
          }}
        />
      )}
    </div>
  );
}
