"use client";

import { useState, useEffect } from "react";
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

            onOpenChange(false);
            if (onSubscriptionComplete) {
              onSubscriptionComplete();
            }
          } catch (error: any) {
            toast({
              title: "Payment Verification Failed",
              description: error.response?.data?.error || "Please contact support",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(null);
          }
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
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
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
                className={`relative transition-all hover:shadow-lg ${
                  plan.popular
                    ? "border-2 border-primary shadow-lg scale-105"
                    : "border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3 py-1 bg-gradient-to-r from-primary to-purple-600 border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6 pt-8">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl w-fit">
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
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
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
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                        : ""
                    }`}
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

        <div className="text-center pt-4 pb-2 border-t">
          <p className="text-xs text-muted-foreground">
            All plans include secure payment processing and can be cancelled anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
