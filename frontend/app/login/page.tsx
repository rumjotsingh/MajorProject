"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService, getDashboardPathForRole } from "@/lib/auth";

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

      const redirectPath = getDashboardPathForRole(user.role);

      // Use router.push instead of window.location.href to prevent page reload
      router.push(redirectPath);
    } catch (error: any) {
      console.error("Login error:", error);
      
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
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
      }

      setFieldErrors(nextErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">

      <Link href="/" className="fixed top-5 left-5 z-50">
        <Button variant="outline" size="sm" className="gap-2">
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
            className="hidden rounded-large border-whisper bg-warm-white p-8 lg:flex lg:flex-col lg:justify-between"
          >
            <div className="space-y-6">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="rounded-standard bg-notion-blue p-2 text-white">
                  <Award className="h-5 w-5" />
                </span>
                <span className="text-body-large font-bold text-near-black">CredMatrix</span>
              </Link>
              <div className="space-y-4">
                <h1 className="text-subheading-large text-near-black leading-tight">
                  Sign in and continue building your verified profile.
                </h1>
                <p className="max-w-md text-body text-warm-gray-500">
                  Access your credentials, analytics, and opportunities from one clean dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-comfortable border-whisper bg-white p-5">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="rounded-standard bg-badge-blue-bg p-1.5 text-notion-blue">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-body-medium">{item}</span>
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
            <Card className="w-full rounded-large border-whisper shadow-notion-deep">
              <CardHeader className="space-y-3 text-center pb-6">
                <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-standard bg-notion-blue text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-subheading text-near-black">Welcome back</CardTitle>
                <CardDescription className="text-body text-warm-gray-500">
                  Sign in to access your credential portfolio
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-body-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-notion-blue/70" />
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
                      className={`h-11 ${fieldErrors.email ? "border-orange focus-visible:ring-orange/30" : ""
                        }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-caption text-orange">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-body-medium flex items-center gap-2">
                        <Lock className="h-4 w-4 text-notion-blue/70" />
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-body-medium text-notion-blue hover:text-notion-blue-active transition-colors"
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
                        className={`h-11 pr-10 ${fieldErrors.password ? "border-orange focus-visible:ring-orange/30" : ""
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray-500 hover:text-near-black transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-caption text-orange">{fieldErrors.password}</p>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {fieldErrors.general && (
                      <motion.div
                        key="error-banner"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-2.5 rounded-standard border border-orange/30 bg-orange/5 px-3.5 py-3 text-body text-orange"
                      >
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{fieldErrors.general}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    className="h-11 w-full text-body-medium group"
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
                    <span className="w-full border-t border-whisper" />
                  </div>
                  <div className="relative flex justify-center text-caption uppercase">
                    <span className="bg-white px-2 text-warm-gray-500">New to CredMatrix?</span>
                  </div>
                </div>

                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="h-11 w-full font-semibold"
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