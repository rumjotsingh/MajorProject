"use client";

import { useState, useEffect, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload, FileText, ArrowLeft, Info, Award, CheckCircle2,
  X, Plus, Loader2, ChevronRight, Sparkles, FileBadge,
  Star, TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function UploadCredentialPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [issueDate, setIssueDate] = useState<Date>();
  const [nsqfLevels, setNsqfLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState<any>(null);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState({ title: "", issuer: "", credits: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelsRes, myLevelRes] = await Promise.all([
          api.get("/nsqf/levels"),
          api.get("/nsqf/my-level"),
        ]);
        setNsqfLevels(levelsRes.data.levels || []);
        setCurrentLevel(myLevelRes.data);
      } catch { /* silent */ }
    };
    fetchData();
  }, []);

  // ── File handling ──
  const processFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10 MB", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  // ── Skills tag input ──
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const handleSkillKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter((sk) => sk !== s));

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({ title: "No file selected", description: "Please select a certificate file", variant: "destructive" });
      return;
    }
    if (!issueDate) {
      toast({ title: "Date required", description: "Please select the issue date", variant: "destructive" });
      return;
    }

    const credits = parseInt(formData.credits);
    if (!credits || credits < 1 || credits > 40) {
      toast({ title: "Invalid credits", description: "Credits must be between 1 and 40", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("metadata", JSON.stringify({
        title: formData.title,
        issuer: formData.issuer,
        issueDate: issueDate.toISOString(),
        credits,
        skills,
      }));

      const response = await api.post("/credentials/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadSuccess(true);
      toast({
        title: "Credential uploaded! 🎉",
        description: response.data.message || `You earned ${response.data.creditsEarned} credits!`,
      });

      setTimeout(() => router.push("/user/credentials"), 2000);
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.error === "Credential limit reached") {
        toast({
          title: "Credential Limit Reached",
          description: error.response.data.message || "Upgrade your plan to add more credentials",
          variant: "destructive",
        });
        setTimeout(() => router.push("/pricing"), 2000);
      } else {
        toast({
          title: "Upload Failed",
          description: error.response?.data?.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Credential Uploaded!</h2>
          <p className="text-muted-foreground">Redirecting to your credentials portfolio…</p>
        </div>
      </div>
    );
  }

  const fileTypeIcon = file?.type === "application/pdf" ? "📄" : "🖼️";
  const credits = parseInt(formData.credits) || 0;
  const isFormReady = formData.title && formData.issuer && formData.credits && issueDate && file;

  return (
    <motion.div initial="hidden" animate="visible" className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ── */}
      <motion.div custom={0} variants={fadeUp} className="flex items-center gap-4">
        <Link href="/user/credentials">
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Upload Credential</h1>
          <p className="text-sm text-muted-foreground">Add a new certificate to your portfolio</p>
        </div>
        {currentLevel && (
          <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 rounded-full border-primary/30 bg-primary/5 text-primary px-3 py-1">
            <Award className="h-3.5 w-3.5" />
            Level {currentLevel.currentLevel}
          </Badge>
        )}
      </motion.div>

      {/* ── Current Level Banner ── */}
      {currentLevel && (
        <motion.div custom={0.5} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 via-primary/4 to-transparent p-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-lg font-bold">Level {currentLevel.currentLevel}</span>
                  <span className="text-sm text-muted-foreground">{currentLevel.levelName}</span>
                  <span className="text-xs text-muted-foreground">· {currentLevel.totalCredits} credits</span>
                </div>
                {currentLevel.progress?.creditsNeeded > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{currentLevel.progress.creditsNeeded} credits to Level {currentLevel.progress.nextLevel}</span>
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(100, ((currentLevel.totalCredits % 10) / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Form Card ── */}
      <motion.div custom={1} variants={fadeUp}>
        <Card className="border-[rgba(0,0,0,0.1)] shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileBadge className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Credential Details</CardTitle>
                <CardDescription className="text-xs">NSQF level is calculated automatically from your total credits</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Credential Title <span className="text-destructive">*</span></label>
                <Input
                  name="title"
                  placeholder="e.g., Full Stack Web Development"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Issuer */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Issuing Organization <span className="text-destructive">*</span></label>
                <Input
                  name="issuer"
                  placeholder="e.g., Coursera, edX, University Name"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Date + Credits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Issue Date <span className="text-destructive">*</span></label>
                  <Input
                    type="date"
                    value={issueDate ? format(issueDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => { if (e.target.value) setIssueDate(new Date(e.target.value)); }}
                    max={format(new Date(), "yyyy-MM-dd")}
                    min="1900-01-01"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    Credits <span className="text-destructive">*</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(1–40)</span>
                  </label>
                  <Input
                    name="credits"
                    type="number"
                    min="1"
                    max="40"
                    placeholder="e.g., 10"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    required
                    className="h-11"
                  />
                  {credits > 0 && (
                    <p className="text-[10px] text-primary">+{credits} credits → brings you closer to Level {Math.min(10, (currentLevel?.currentLevel || 1) + 1)}</p>
                  )}
                </div>
              </div>

              {/* Skills Tag Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Skills</label>
                <div className="rounded-xl border border-input bg-background px-3 py-2 min-h-[44px] flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all duration-200">
                  <AnimatePresence>
                    {skills.map((sk) => (
                      <motion.span
                        key={sk}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {sk}
                        <button type="button" onClick={() => removeSkill(sk)} className="hover:text-destructive transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKey}
                    onBlur={addSkill}
                    placeholder={skills.length === 0 ? "Type a skill and press Enter…" : "Add more…"}
                    className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Press Enter or comma to add a skill tag</p>
              </div>

              {/* File Drop Zone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Certificate File <span className="text-destructive">*</span></label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <motion.div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative rounded-xl p-8 text-center cursor-pointer transition-all duration-200 overflow-hidden ${
                    dragging 
                      ? "bg-[#f2f9ff] scale-[1.01] border border-[#0075de]/30" 
                      : file 
                      ? "bg-[#f2f9ff]/50 border border-[rgba(0,0,0,0.1)]" 
                      : "hover:bg-[#f6f5f4] border border-[rgba(0,0,0,0.1)] hover:border-[#0075de]/20"
                  }`}
                >
                  {/* glow when file present */}
                  {file && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />}

                  {file ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative flex flex-col items-center gap-3"
                    >
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                        {fileTypeIcon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs border-[rgba(0,0,0,0.1)]"
                        onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      >
                        <X className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                        <Upload className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {dragging ? "Drop it here!" : "Drop your certificate here"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">or click to browse · PDF, PNG, JPG up to 10 MB</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Info box */}
              <div className="flex gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
                <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-primary/80 leading-relaxed">
                  Your <strong>NSQF level</strong> is calculated automatically from total accumulated credits. Each credential moves you closer to a higher level and better job matches.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-full border-[rgba(0,0,0,0.1)]"
                  onClick={() => router.push("/usera/credentials")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full gap-2 group"
                  disabled={loading || !isFormReady}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Upload Credential <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Progress Preview ── */}
      {credits > 0 && currentLevel && (
        <motion.div custom={2} variants={fadeUp}>
          <Card className="border-[rgba(0,0,0,0.1)] border-primary/10 bg-primary/[0.02]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold">After uploading this credential</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You'll have <strong>{(currentLevel.totalCredits || 0) + credits} total credits</strong>
                    {credits > 0 && ` (+${credits} new)`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── NSQF Reference ── */}
      {nsqfLevels.length > 0 && (
        <motion.div custom={3} variants={fadeUp}>
          <Card className="border-[rgba(0,0,0,0.1)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> NSQF Level Reference
              </CardTitle>
              <CardDescription className="text-xs">Credit thresholds for each level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {nsqfLevels.map((level) => {
                  const isCurrentLev = currentLevel?.currentLevel === level.level;
                  return (
                    <div
                      key={level.level}
                      className={`p-3 rounded-xl border transition-all duration-200 ${
                        isCurrentLev
                          ? "border-primary/40 bg-primary/8 shadow-sm shadow-primary/10"
                          : "border-[rgba(0,0,0,0.1)] hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className={`font-semibold text-xs ${isCurrentLev ? "text-primary" : ""}`}>
                            {isCurrentLev && "★ "}Level {level.level}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{level.description}</p>
                        </div>
                        <span className={`text-[10px] flex-shrink-0 tabular-nums ${isCurrentLev ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {level.minCredits}–{level.maxCredits === "Unlimited" ? "∞" : level.maxCredits}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
