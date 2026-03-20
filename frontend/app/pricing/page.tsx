"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { BackToHome } from "@/components/back-to-home";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Crown, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { authService } from "@/lib/auth";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    icon: Zap,
    description: "Perfect for getting started",
    features: [
      { name: "Up to 10 credentials", included: true },
      { name: "Up to 20 skills", included: true },
      { name: "Basic analytics", included: true },
      { name: "AI recommendations", included: false },
      { name: "Priority support", included: false },
      { name: "Custom branding", included: false },
      { name: "API access", included: false },
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    icon: Crown,
    description: "For professionals and growing teams",
    features: [
      { name: "Up to 100 credentials", included: true },
      { name: "Up to 100 skills", included: true },
      { name: "Advanced analytics", included: true },
      { name: "AI recommendations", included: true },
      { name: "Priority support", included: true },
      { name: "Custom branding", included: false },
      { name: "API access", included: true },
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 4999,
    icon: Building2,
    description: "For large organizations",
    features: [
      { name: "Unlimited credentials", included: true },
      { name: "Unlimited skills", included: true },
      { name: "Advanced analytics", included: true },
      { name: "AI recommendations", included: true },
      { name: "Priority support", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: true },
    ],
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    loadCurrentSubscription();
    loadRazorpayScript();
    
    // Check for pending subscription after login
    const pendingPlan = localStorage.getItem("pendingSubscription");
    if (pendingPlan && authService.isAuthenticated()) {
      localStorage.removeItem("pendingSubscription");
      // Auto-trigger subscription flow
      setTimeout(() => handleSubscribe(pendingPlan), 1000);
    }
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  const loadCurrentSubscription = async () => {
    if (!authService.isAuthenticated()) {
      return;
    }
    
    try {
      const response = await api.get("/payment/subscription");
      setCurrentPlan(response.data.subscription.plan);
      setUsage(response.data.usage);
    } catch (error) {
      console.error("Failed to load subscription:", error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!authService.isAuthenticated()) {
      // Save selected plan to localStorage and redirect to login
      localStorage.setItem("pendingSubscription", planId);
      toast({
        title: "Login Required",
        description: "Please login to continue with your subscription",
      });
      router.push("/login?redirect=/pricing");
      return;
    }

    if (planId === "free") {
      toast({
        title: "Already on Free Plan",
        description: "You're currently on the free plan",
      });
      return;
    }

    try {
      setLoading(planId);

      // Create order
      const orderResponse = await api.post("/payment/create-order", {
        plan: planId,
      });

      const { orderId, amount, currency, keyId } = orderResponse.data;

      // Razorpay options
      const options = {
        key: keyId,
        amount,
        currency,
        name: "CredMatrix",
        description: `${plans.find(p => p.id === planId)?.name} Plan Subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            });

            toast({
              title: "Success! 🎉",
              description: verifyResponse.data.message,
            });

            setCurrentPlan(planId);
            router.push("/dashboard");
          } catch (error: any) {
            toast({
              title: "Payment Verification Failed",
              description: error.response?.data?.error || "Please contact support",
              variant: "destructive",
            });
          }
        },
        prefill: {
          email: authService.getCurrentUser()?.email || "",
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <BackToHome />
      
      <main className="flex-1 bg-gradient-to-b from-background to-muted/20">
        <div className="container py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your credential management needs
          </p>
          
          {/* Current Usage - Show only if logged in */}
          {authService.isAuthenticated() && usage && (
            <Card className="max-w-md mx-auto mt-8 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Your Current Usage</p>
                  <div className="flex items-center justify-center gap-6">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {usage.credentials}
                        <span className="text-sm text-muted-foreground">
                          /{usage.maxCredentials === -1 ? "∞" : usage.maxCredentials}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">Credentials</p>
                    </div>
                  </div>
                  {usage.maxCredentials !== -1 && usage.credentials >= usage.maxCredentials * 0.8 && (
                    <p className="text-xs text-orange-500 mt-2">
                      ⚠️ You're approaching your credential limit. Consider upgrading!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ₹{plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span
                          className={
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id || isCurrentPlan}
                  >
                    {loading === plan.id
                      ? "Processing..."
                      : isCurrentPlan
                      ? "Current Plan"
                      : plan.price === 0
                      ? "Get Started"
                      : "Subscribe Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a refund policy?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we offer a 7-day money-back guarantee for all paid plans. No questions asked.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </main>
      
      <LandingFooter />
    </div>
  );
}
