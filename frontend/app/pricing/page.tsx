"use client";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { BackToHome } from "@/components/back-to-home";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "Up to 10 credentials",
      "Basic skill mapping",
      "Public portfolio",
      "Email support",
      "Mobile app access",
    ],
  },
  {
    name: "Pro",
    price: "9",
    description: "For serious learners",
    features: [
      "Unlimited credentials",
      "Advanced skill analytics",
      "Custom portfolio URL",
      "Priority support",
      "Export to PDF",
      "Verified badge",
      "Career recommendations",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For institutions and organizations",
    features: [
      "Everything in Pro",
      "Bulk credential issuance",
      "Custom branding",
      "API access",
      "Dedicated support",
      "SSO integration",
      "Analytics dashboard",
      "White-label option",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <BackToHome />

      <main className="flex-1">
        <section className="container py-16 md:py-24">
          {/* Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 max-w-4xl mx-auto px-4"
          >
            <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2">💳 Pricing Plans Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Currently, all features are free during our beta phase. Paid plans will be introduced later. 
                    The pricing shown below is for reference only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center space-y-4 md:space-y-6 mb-12 md:mb-16 px-4"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
              Choose the plan that's right for you. Upgrade or downgrade anytime.
            </p>
          </motion.div>

          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={plan.popular ? "border-primary shadow-lg scale-105" : ""}>
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium rounded-t-xl">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.price === "Custom" ? plan.price : `$${plan.price}`}
                      </span>
                      {plan.price !== "Custom" && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className="block">
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
