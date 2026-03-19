"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, FileText, ArrowLeft, Info, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Link from "next/link";
import api from "@/lib/api";

export default function UploadCredentialPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [issueDate, setIssueDate] = useState<Date>();
  const [nsqfLevels, setNsqfLevels] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    credits: "",
    skills: "",
  });
  const { toast } = useToast();
  const router = useRouter();

  // Fetch NSQF levels and current user level
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelsRes, myLevelRes] = await Promise.all([
          api.get("/nsqf/levels"),
          api.get("/nsqf/my-level"),
        ]);
        setNsqfLevels(levelsRes.data.levels || []);
        setCurrentLevel(myLevelRes.data);
      } catch (error) {
        console.error("Failed to fetch NSQF data:", error);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!issueDate) {
      toast({
        title: "Error",
        description: "Please select an issue date",
        variant: "destructive",
      });
      return;
    }

    const credits = parseInt(formData.credits);
    if (!credits || credits < 1 || credits > 40) {
      toast({
        title: "Error",
        description: "Credits must be between 1 and 40",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare form data
      const uploadData = new FormData();
      uploadData.append("file", file);
      
      // Parse skills from comma-separated string
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const metadata = {
        title: formData.title,
        issuer: formData.issuer,
        issueDate: issueDate.toISOString(),
        credits: credits,
        skills: skillsArray,
      };

      uploadData.append("metadata", JSON.stringify(metadata));

      // Upload credential
      const response = await api.post("/credentials/upload", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Success! 🎉",
        description: response.data.message || `You earned ${response.data.creditsEarned} credits!`,
      });

      // Redirect to credentials page
      setTimeout(() => {
        router.push("/credentials");
      }, 2000);
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to upload credential",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/credentials">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Credential</h1>
          <p className="text-muted-foreground">Add a new credential to your portfolio</p>
        </div>
      </div>

      {/* Current Level Info */}
      {currentLevel && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-2xl font-bold">
                  Level {currentLevel.currentLevel} - {currentLevel.levelName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentLevel.totalCredits} credits earned
                  {currentLevel.progress?.creditsNeeded > 0 && (
                    <span className="ml-2">
                      • {currentLevel.progress.creditsNeeded} more for Level {currentLevel.progress.nextLevel}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Credential Details</CardTitle>
          <CardDescription>
            Fill in the details of your credential. NSQF level will be calculated automatically based on your total credits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Credential Title *</label>
              <Input 
                name="title"
                placeholder="e.g., Full Stack Web Development" 
                value={formData.title}
                onChange={handleInputChange}
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Issuing Organization *</label>
              <Input 
                name="issuer"
                placeholder="e.g., Coursera, edX, University Name" 
                value={formData.issuer}
                onChange={handleInputChange}
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Date *</label>
                <Input 
                  type="date"
                  value={issueDate ? format(issueDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setIssueDate(new Date(e.target.value));
                    }
                  }}
                  max={format(new Date(), "yyyy-MM-dd")}
                  min="1900-01-01"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Credits *
                  <Info className="h-4 w-4 text-muted-foreground" />
                </label>
                <Input 
                  name="credits"
                  type="number" 
                  min="1" 
                  max="40" 
                  placeholder="1-40"
                  value={formData.credits}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter credits earned (1-40)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Skills (comma-separated)</label>
              <Input 
                name="skills"
                placeholder="e.g., React, Node.js, MongoDB" 
                value={formData.skills}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">
                Enter skills separated by commas
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Certificate *</label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, PNG, JPG (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    About NSQF Levels
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your NSQF level is automatically calculated based on your total accumulated credits. 
                    Each credential you upload adds to your total, helping you progress through the levels.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push("/credentials")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading || !file}
              >
                {loading ? "Uploading..." : "Upload Credential"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* NSQF Levels Reference */}
      {nsqfLevels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">NSQF Level Reference</CardTitle>
            <CardDescription>Credit requirements for each level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {nsqfLevels.map((level) => (
                <div
                  key={level.level}
                  className={`p-3 rounded-lg border ${
                    currentLevel?.currentLevel === level.level
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">Level {level.level}</p>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {level.minCredits}-{level.maxCredits === "Unlimited" ? "∞" : level.maxCredits}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
