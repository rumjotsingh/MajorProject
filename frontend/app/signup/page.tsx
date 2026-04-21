"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Mail, Lock, User, Loader2, GraduationCap, Briefcase, Building2, ArrowLeft, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const roles = [
  {
    value: "Learner" as const,
    label: "Learner",
    description: "Build your skill portfolio",
    icon: GraduationCap,
  },
  {
    value: "Employer" as const,
    label: "Employer",
    description: "Find skilled talent",
    icon: Briefcase,
  },
  {
    value: "Issuer" as const,
    label: "Issuer",
    description: "Issue credentials",
    icon: Building2,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    companyName: "",
    institutionName: "",
    role: "" as "Learner" | "Employer" | "Issuer" | "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role) {
      toast({
        title: "Role required",
        description: "Please select your role to continue",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === "Employer" && !formData.companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter your company name",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === "Issuer" && !formData.institutionName.trim()) {
      toast({
        title: "Institution name required",
        description: "Please enter your institution name",
        variant: "destructive",
      });
      return;
    }

    if ((formData.role === "Employer" || formData.role === "Issuer") && !formData.mobile.trim()) {
      toast({
        title: "Mobile number required",
        description: "Please enter your mobile number",
        variant: "destructive",
      });
      return;
    }

    if ((formData.role === "Employer" || formData.role === "Issuer") && formData.mobile.length !== 10) {
      toast({
        title: "Invalid mobile number",
        description: "Mobile number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        mobile: formData.mobile || undefined,
        companyName: formData.companyName || undefined,
        institutionName: formData.institutionName || undefined,
      });

      toast({
        title: "Account created successfully!",
        description: "Please sign in with your credentials",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.error || error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 gradient-mesh-hero" />
      <div className="absolute inset-0 dot-pattern opacity-20" />
      
      {/* Animated orbs */}
      <div className="absolute -top-24 left-[5%] h-72 w-72 rounded-full bg-primary/12 blur-3xl animate-orb-1" />
      <div className="absolute -bottom-28 right-[10%] h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-orb-2" />

      <Link href="/" className="fixed top-5 left-5 z-50">
        <Button variant="outline" size="sm" className="gap-2 rounded-full bg-background/80 backdrop-blur-xl border-border/50">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back Home</span>
        </Button>
      </Link>

      <div className="container relative z-10 py-10 md:py-14">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-large border-whisper shadow-notion-deep">
              <CardHeader className="space-y-3 pb-6">
                <div className="flex items-center gap-3">
                  <span className="rounded-standard bg-notion-blue p-2 text-white">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-section-heading text-near-black">Create your account</CardTitle>
                    <CardDescription className="text-body text-warm-gray-500">Choose your role and start in minutes</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">I am a...</label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = formData.role === role.value;

                        return (
                          <motion.button
                            key={role.value}
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, role: role.value })}
                            className={cn(
                              "relative rounded-standard border p-4 text-left transition-all duration-200",
                              isSelected
                                ? "border-notion-blue/50 bg-badge-blue-bg"
                                : "border-whisper bg-white hover:border-notion-blue/30 hover:bg-badge-blue-bg/30"
                            )}
                          >
                            <Icon className={cn("mb-2 h-5 w-5", isSelected ? "text-notion-blue" : "text-warm-gray-500")} />
                            <div className={cn("text-body-semibold", isSelected && "text-notion-blue")}>{role.label}</div>
                            <div className={cn("mt-1 text-caption", isSelected ? "text-notion-blue/70" : "text-warm-gray-500")}>{role.description}</div>
                            {isSelected && (
                              <motion.div
                                layoutId="roleIndicator"
                                className="absolute top-2 right-2 h-2 w-2 rounded-full bg-notion-blue"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {formData.role === "Employer" && (
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary/70" />
                        Company Name
                      </label>
                      <Input
                        id="companyName"
                        placeholder="Your company name"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>
                  )}

                  {formData.role === "Issuer" && (
                    <div className="space-y-2">
                      <label htmlFor="institutionName" className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary/70" />
                        Institution Name
                      </label>
                      <Input
                        id="institutionName"
                        placeholder="Your institution name"
                        value={formData.institutionName}
                        onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary/70" />
                      {formData.role === "Employer" || formData.role === "Issuer" ? "Contact Person Name" : "Full Name"}
                    </label>
                    <Input
                      id="name"
                      placeholder={formData.role === "Employer" || formData.role === "Issuer" ? "Contact person name" : "John Doe"}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>

                  {(formData.role === "Employer" || formData.role === "Issuer") ? (
                    <div className="grid gap-4 md:grid-cols-2">
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
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-11 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="mobile" className="text-sm font-medium">Mobile Number</label>
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="10-digit number"
                          value={formData.mobile}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setFormData({ ...formData, mobile: value });
                          }}
                          maxLength={10}
                          pattern="\d{10}"
                          required
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  ) : (
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
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary/70" />
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          className="h-11 rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                          className="h-11 rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">Use at least 8 characters for a stronger password.</p>

                  <Button type="submit" className="h-11 w-full rounded-xl text-base font-semibold" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Already have an account?</span>
                  </div>
                </div>

                <Link href="/login">
                  <Button variant="outline" className="h-11 w-full rounded-xl font-semibold border-border/60 hover:border-primary/30">
                    Sign In Instead
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="hidden rounded-large border-whisper bg-warm-white p-8 lg:flex lg:flex-col lg:justify-between"
          >
            <div className="space-y-6">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2 text-primary-foreground shadow-md shadow-primary/20">
                  <Award className="h-5 w-5" />
                </span>
                <span className="text-2xl font-bold">CredMatrix</span>
              </Link>
              <h2 className="text-4xl font-bold leading-tight">
                Launch your <span className="text-gradient-brand">verified profile</span> with a role that fits you.
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Whether you are learning, hiring, or issuing credentials, this setup creates the right workspace for your goals.
              </p>
            </div>

            <div className="space-y-4 rounded-comfortable border-whisper bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="rounded-standard bg-badge-blue-bg p-1.5 text-notion-blue">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-body-semibold">Smart onboarding</p>
                  <p className="text-caption text-warm-gray-500">Fields adapt to your selected role.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="rounded-standard bg-badge-blue-bg p-1.5 text-notion-blue">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-body-semibold">Secure verification workflow</p>
                  <p className="text-caption text-warm-gray-500">Credential-ready profile from day one.</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
