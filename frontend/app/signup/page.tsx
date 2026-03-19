"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Mail, Lock, User, Loader2, GraduationCap, Briefcase, Building2, ArrowLeft, Eye, EyeOff } from "lucide-react";
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

    // Validate role-specific required fields
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

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Back to Home Button */}
      <Link href="/" className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          className="glass glass-border backdrop-blur-xl gap-2 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Home</span>
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Award className="h-10 w-10 text-primary" />
            </motion.div>
            <span className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              CredMatrix
            </span>
          </Link>
        </div>

        <Card className="border-2 shadow-2xl">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-3xl font-bold">Create your account</CardTitle>
            <CardDescription className="text-base">
              Join thousands building their skill portfolios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">I am a...</label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = formData.role === role.value;
                    
                    return (
                      <motion.button
                        key={role.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, role: role.value })}
                        className={cn(
                          "relative p-4 rounded-lg border-2 transition-all text-left",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Icon className={cn(
                          "h-6 w-6 mb-2",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div className="font-semibold text-sm">{role.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {role.description}
                        </div>
                        {isSelected && (
                          <motion.div
                            layoutId="role-indicator"
                            className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Company/Institution Name (for Employer/Issuer) */}
              {formData.role === "Employer" && (
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Company Name
                  </label>
                  <Input
                    id="companyName"
                    placeholder="Your company name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
              )}

              {formData.role === "Issuer" && (
                <div className="space-y-2">
                  <label htmlFor="institutionName" className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Institution Name
                  </label>
                  <Input
                    id="institutionName"
                    placeholder="Your institution name"
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {formData.role === "Employer" || formData.role === "Issuer" ? "Contact Person Name" : "Full Name"}
                </label>
                <Input
                  id="name"
                  placeholder={formData.role === "Employer" || formData.role === "Issuer" ? "Contact person name" : "John Doe"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Email and Mobile */}
              {(formData.role === "Employer" || formData.role === "Issuer") ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="mobile" className="text-sm font-medium">
                      Mobile Number
                    </label>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="10-digit number"
                      value={formData.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, mobile: value });
                      }}
                      maxLength={10}
                      pattern="\d{10}"
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
              )}

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
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
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold" 
                disabled={loading}
              >
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
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link href="/login">
              <Button variant="outline" className="w-full h-11 font-semibold">
                Sign In Instead
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
