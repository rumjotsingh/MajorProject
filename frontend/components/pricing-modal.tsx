"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Crown, Building2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

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
      { name: "API access", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    icon: Crown,
    description: "For professionals",
    features: [
      { name: "Up to 100 credentials", included: true },
      { name: "Up to 100 skills", included: true },
      { name: "Advanced analytics", included: true },
      { name: "AI recommendations", included: true },
      { name: "Priority support", included: true },
      { name: "API access", included: true },
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 4999,
    icon: Building2,
    description: "For organizations",
    features: [
      { name: "Unlimited credentials", included: true },
      { name: "Unlimited skills", included: true },
      { name: "Advanced analytics", included: true },
      { name: "AI recommendations", included: true },
      { name: "Priority support", included: true },
      { name: "API access", included: true },
    ],
  },
];

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
  onSubscriptionComplete?: () => void;
}

export function PricingModal({ open, onOpenChange, currentPlan = "free", onSubscriptionComplete }: PricingModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  // Keep ref to Razorpay instance for cleanup
  const razorpayRef = useRef<any>(null);
  // Track selected plan so we can re-open modal on dismiss
  const pendingPlanRef = useRef<string | null>(null);

  // When user closes our Dialog while Razorpay is open, also close Razorpay
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && razorpayRef.current) {
        try {
          razorpayRef.current.close();
        } catch (_) {
          // ignore if already closed
        }
        razorpayRef.current = null;
        setLoading(null);
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (open) {
      loadRazorpayScript();
    }
  }, [open]);

  const loadRazorpayScript = () => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  const handleSubscribe = async (planId: string) => {
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

      // ─── KEY FIX ────────────────────────────────────────────────────────────
      // Close our Dialog BEFORE opening Razorpay.
      // The Radix UI Dialog overlay intercepts all pointer events, which makes
      // the Razorpay checkout appear frozen/unclickable when both are open.
      // We hide the Dialog first, let Razorpay run, then re-open if dismissed.
      pendingPlanRef.current = planId;
      onOpenChange(false);
      // ────────────────────────────────────────────────────────────────────────

      const options = {
        key: keyId,
        amount,
        currency,
        name: "CredMatrix",
        description: `${plans.find((p) => p.id === planId)?.name} Plan Subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          // Payment successful — verify on backend
          try {
            const verifyResponse = await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            });

            toast({
              title: "Payment Successful! 🎉",
              description: verifyResponse.data.message,
            });

            razorpayRef.current = null;
            pendingPlanRef.current = null;
            setLoading(null);
            if (onSubscriptionComplete) {
              onSubscriptionComplete();
            }
          } catch (error: any) {
            toast({
              title: "Payment Verification Failed",
              description: error.response?.data?.error || "Please contact support",
              variant: "destructive",
            });
            // Re-open the pricing modal so user can retry
            razorpayRef.current = null;
            pendingPlanRef.current = null;
            setLoading(null);
            onOpenChange(true);
          }
        },
        modal: {
          ondismiss: function () {
            // User closed Razorpay without paying — re-open our pricing modal
            razorpayRef.current = null;
            pendingPlanRef.current = null;
            setLoading(null);
            onOpenChange(true);
          },
        },
        theme: {
          color: "#6366f1",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpayRef.current = razorpay;
      // Small delay to let the Dialog finish its close animation before
      // Razorpay injects its own overlay into the DOM
      setTimeout(() => razorpay.open(), 150);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create order",
        variant: "destructive",
      });
      setLoading(null);
      // Re-open the modal on network/order error
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">Choose Your Plan</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select the perfect plan for your needs
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 py-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-primary/40 shadow-xl shadow-primary/10 scale-105"
                    : "border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3 py-1 bg-gradient-to-r from-primary to-primary/80 border-0 shadow-md shadow-primary/20">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6 pt-8">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-2xl w-fit">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-sm mb-4">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">₹{plan.price}</span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground text-sm">/month</span>
                      )}
                    </div>
                    {plan.price === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">Forever free</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : (
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <X className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full rounded-xl"
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id || isCurrentPlan}
                  >
                    {loading === plan.id
                      ? "Processing..."
                      : isCurrentPlan
                      ? "Current Plan"
                      : plan.price === 0
                      ? "Current Plan"
                      : "Subscribe Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center pt-4 pb-2 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            All plans include secure payment processing and can be cancelled anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
