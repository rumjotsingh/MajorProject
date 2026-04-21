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
import { motion } from "framer-motion";

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
          color: "#6366f1",
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
      
      <main className="flex-1">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh-hero" />
          <div className="absolute top-20 right-[20%] w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-orb-1" />
          <div className="absolute bottom-20 left-[15%] w-72 h-72 rounded-full bg-primary/[0.07] blur-3xl animate-orb-2" />
          
          <div className="container relative py-12 md:py-20">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Choose Your <span className="text-gradient-brand">Plan</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Select the perfect plan for your credential management needs
              </p>
              
              {/* Current Usage - Show only if logged in */}
              {authService.isAuthenticated() && usage && (
                <Card className="max-w-md mx-auto mt-8 border-primary/20 bg-primary/[0.03]">
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
                        <p className="text-xs text-amber-500 mt-2">
                          ⚠️ You&apos;re approaching your credential limit. Consider upgrading!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => {
                const Icon = plan.icon;
                const isCurrentPlan = currentPlan === plan.id;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card
                      className={`relative h-full transition-all duration-300 ${
                        plan.popular
                          ? "border-primary/40 shadow-xl shadow-primary/10 scale-105"
                          : "border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04]"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="px-4 py-1 bg-gradient-to-r from-primary to-primary/80 border-0 shadow-md shadow-primary/20">Most Popular</Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-8">
                        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-2xl w-fit">
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
                            <li key={i} className="flex items-center gap-3">
                              {feature.included ? (
                                <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                </div>
                              ) : (
                                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                  <X className="h-3 w-3 text-muted-foreground" />
                                </div>
                              )}
                              <span
                                className={
                                  feature.included
                                    ? "text-foreground text-sm"
                                    : "text-muted-foreground text-sm"
                                }
                              >
                                {feature.name}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <Button
                          className={`w-full rounded-xl ${plan.popular ? "" : ""}`}
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
                  </motion.div>
                );
              })}
            </div>

            {/* FAQ Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-20 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-center mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {[
                  {
                    q: "Can I change plans later?",
                    a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected immediately.",
                  },
                  {
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay.",
                  },
                  {
                    q: "Is there a refund policy?",
                    a: "Yes, we offer a 7-day money-back guarantee for all paid plans. No questions asked.",
                  },
                ].map((faq, i) => (
                  <Card key={i} className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.q}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <LandingFooter />
    </div>
  );
}
