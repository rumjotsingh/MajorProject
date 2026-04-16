"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/lib/auth";

const highlights = [
  "Unified credential portfolio",
  "Role-based dashboard access",
  "Verification-ready records",
];

export default function LoginPage() {
  const router = useRouter();
  // Track whether we've already mounted so motion wrappers don't
  // replay their entrance animation on every error-driven re-render.
  const mounted = useRef(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // After first render, disable re-entrance animations
  if (typeof window !== "undefined" && !mounted.current) {
    mounted.current = true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({ email: "", password: "", general: "" });
    setLoading(true);

    try {
      const { user } = await authService.login(formData);

      const roleRedirectMap: Record<string, string> = {
        Learner: "/dashboard",
        Employer: "/employer/dashboard",
        Issuer: "/issuer/dashboard",
        Admin: "/admin/dashboard",
      };

      const redirectPath = roleRedirectMap[user.role] || "/dashboard";

      // ✅ Use router.push instead of window.location.href
      // This keeps it client-side — no page reload, no state wipe
      router.push(redirectPath);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Invalid email or password";

      const normalizedError = String(errorMessage).toLowerCase();
      const nextErrors = { email: "", password: "", general: "" };

      if (normalizedError.includes("email")) {
        nextErrors.email = errorMessage;
      } else if (normalizedError.includes("password")) {
        nextErrors.password = errorMessage;
      } else {
        nextErrors.general = errorMessage;
        nextErrors.email = "Check username/email and password";
        nextErrors.password = "Check username/email and password";
      }

      setFieldErrors(nextErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 gradient-mesh-hero" />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      {/* Animated orbs */}
      <div className="absolute -top-32 -left-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-orb-1" />
      <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-orb-2" />
      <div className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-primary/[0.06] blur-3xl" />

      <Link href="/" className="fixed top-5 left-5 z-50">
        <Button variant="outline" size="sm" className="gap-2 rounded-full bg-background/80 backdrop-blur-xl border-border/50">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back Home</span>
        </Button>
      </Link>

      <div className="container relative z-10 flex min-h-screen items-center py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
          {/* Left panel */}
          <motion.section
            initial={!mounted.current ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="hidden rounded-3xl border border-border/50 bg-muted/30 backdrop-blur-sm p-8 lg:flex lg:flex-col lg:justify-between"
          >
            <div className="space-y-6">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2 text-primary-foreground shadow-md shadow-primary/20">
                  <Award className="h-5 w-5" />
                </span>
                <span className="text-2xl font-bold">CredMatrix</span>
              </Link>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">
                  Sign in and continue building your{" "}
                  <span className="text-gradient-brand">verified profile.</span>
                </h1>
                <p className="max-w-md text-sm text-muted-foreground">
                  Access your credentials, analytics, and opportunities from one clean dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-sm p-5">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Right panel — Login form */}
          <motion.div
            initial={!mounted.current ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex w-full max-w-md items-center"
          >
            <Card className="w-full rounded-3xl border-border/50 shadow-2xl shadow-primary/[0.04]">
              <CardHeader className="space-y-3 text-center pb-6">
                <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription className="text-base">
                  Sign in to access your credential portfolio
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary/70" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (fieldErrors.email || fieldErrors.general) {
                          setFieldErrors((prev) => ({ ...prev, email: "", general: "" }));
                        }
                      }}
                      required
                      className={`h-11 rounded-xl ${fieldErrors.email ? "border-destructive focus-visible:ring-destructive/30" : ""
                        }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-destructive">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary/70" />
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot?
                      </Link>
                    </div>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (fieldErrors.password || fieldErrors.general) {
                            setFieldErrors((prev) => ({ ...prev, password: "", general: "" }));
                          }
                        }}
                        required
                        className={`h-11 rounded-xl pr-10 ${fieldErrors.password ? "border-destructive focus-visible:ring-destructive/30" : ""
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-xs text-destructive">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* General error banner — animated independently so only IT animates on error, not the whole page */}
                  <AnimatePresence mode="wait">
                    {fieldErrors.general && (
                      <motion.div
                        key="error-banner"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
                      >
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{fieldErrors.general}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl text-base font-semibold group"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">New to CredMatrix?</span>
                  </div>
                </div>

                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-xl font-semibold border-border/60 hover:border-primary/30"
                  >
                    Create an Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}